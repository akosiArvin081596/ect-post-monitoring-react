import { useEffect, useRef, useState } from 'react'
import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { TextInput } from '../ui/TextInput'
import { SelectInput } from '../ui/SelectInput'
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
  getBarangays,
} from '../../lib/addressCache'

export function AddressStep() {
  const { formData, updateFormData, nextStep, prevStep } = useSurveyWizard()

  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>([])
  // null = loading / not yet fetched, [] = fetched and empty, [...] = fetched and populated.
  const [barangays, setBarangays] = useState<string[] | null>([])
  const [showBarangaySuggestions, setShowBarangaySuggestions] = useState(false)
  const [barangayActiveIndex, setBarangayActiveIndex] = useState(-1)
  const [isLoadingGPS, setIsLoadingGPS] = useState(false)
  const barangayContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (formData.province) {
      getDistricts(formData.province).then(setDistricts)
      if (!formData.district) {
        updateFormData({ district: '', municipality: '' })
      }
    }
  }, [formData.province])

  useEffect(() => {
    if (formData.province && formData.district) {
      getMunicipalities(formData.province, formData.district).then(setMunicipalities)
      if (!formData.municipality) {
        updateFormData({ municipality: '' })
      }
    }
  }, [formData.province, formData.district])

  useEffect(() => {
    let cancelled = false
    // All setState calls are routed through a microtask so React's strict
    // "no synchronous setState in an effect" rule is satisfied.
    if (!(formData.province && formData.district && formData.municipality)) {
      Promise.resolve().then(() => {
        if (!cancelled) setBarangays([])
      })
      return () => {
        cancelled = true
      }
    }
    Promise.resolve()
      .then(() => {
        if (!cancelled) setBarangays(null)
      })
      .then(() =>
        getBarangays(formData.province, formData.district, formData.municipality)
      )
      .then((list) => {
        if (!cancelled) setBarangays(list)
      })
    return () => {
      cancelled = true
    }
  }, [formData.province, formData.district, formData.municipality])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        barangayContainerRef.current &&
        !barangayContainerRef.current.contains(e.target as Node)
      ) {
        setShowBarangaySuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsLoadingGPS(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
        })
        setIsLoadingGPS(false)
      },
      (error) => {
        console.error('GPS error:', error)
        alert('Unable to get your location. Please try again.')
        setIsLoadingGPS(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const canProceed =
    formData.province &&
    formData.district &&
    formData.municipality &&
    formData.barangay

  const barangaysLoading = barangays === null
  const barangayList = barangays ?? []
  const filteredBarangays = formData.barangay
    ? barangayList.filter((b) =>
        b.toLowerCase().includes(formData.barangay.toLowerCase())
      )
    : barangayList

  const hasBarangayList = barangayList.length > 0
  const canPickBarangay = !!formData.municipality

  const selectBarangay = (value: string) => {
    updateFormData({ barangay: value })
    setShowBarangaySuggestions(false)
    setBarangayActiveIndex(-1)
  }

  const onBarangayKeyDown = (e: React.KeyboardEvent) => {
    if (!showBarangaySuggestions || filteredBarangays.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setBarangayActiveIndex((prev) =>
        prev < filteredBarangays.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setBarangayActiveIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && barangayActiveIndex >= 0) {
      e.preventDefault()
      selectBarangay(filteredBarangays[barangayActiveIndex])
    } else if (e.key === 'Escape') {
      setShowBarangaySuggestions(false)
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Address Information
      </h2>

      <SelectInput
        label="Province"
        options={provinces.map((p) => ({ value: p, label: p }))}
        value={formData.province}
        onChange={(v) =>
          updateFormData({ province: v, district: '', municipality: '', barangay: '' })
        }
        required
      />

      <SelectInput
        label="District"
        options={districts.map((d) => ({ value: d, label: d }))}
        value={formData.district}
        onChange={(v) => updateFormData({ district: v, municipality: '', barangay: '' })}
        required
        disabled={!formData.province}
      />

      <SelectInput
        label="Municipality/City"
        options={municipalities.map((m) => ({ value: m, label: m }))}
        value={formData.municipality}
        onChange={(v) => updateFormData({ municipality: v, barangay: '' })}
        required
        disabled={!formData.district}
      />

      {/* Barangay — autocomplete when the LGU has a seeded list, free-text otherwise. */}
      <div className="relative mb-4" ref={barangayContainerRef}>
        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
          Barangay
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.barangay}
          onChange={(e) => {
            updateFormData({ barangay: e.target.value })
            setBarangayActiveIndex(-1)
            if (hasBarangayList) setShowBarangaySuggestions(true)
          }}
          onFocus={() => hasBarangayList && setShowBarangaySuggestions(true)}
          onKeyDown={onBarangayKeyDown}
          required
          disabled={!canPickBarangay}
          placeholder={
            !canPickBarangay
              ? 'Select municipality first'
              : hasBarangayList
                ? 'Start typing to filter, or pick from list'
                : barangaysLoading
                  ? 'Loading barangays…'
                  : 'Type the barangay name'
          }
          autoComplete="off"
          className="h-14 w-full border border-gray-300 bg-white px-4 py-3 text-base leading-6 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 sm:text-lg"
        />
        {showBarangaySuggestions && hasBarangayList && filteredBarangays.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {filteredBarangays.map((barangay, index) => (
              <li
                key={barangay}
                onClick={() => selectBarangay(barangay)}
                onMouseEnter={() => setBarangayActiveIndex(index)}
                className={`cursor-pointer px-4 py-3 text-base text-gray-900 dark:text-white ${
                  index === barangayActiveIndex
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {barangay}
              </li>
            ))}
          </ul>
        )}
        {canPickBarangay && !hasBarangayList && !barangaysLoading && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            No barangay list available for this municipality — type the name manually.
          </p>
        )}
      </div>

      <TextInput
        label="Sitio/Purok/Street"
        value={formData.sitioPurokStreet}
        onChange={(v) => updateFormData({ sitioPurokStreet: v })}
      />

      <div className="border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between gap-3">
          <label className="text-base font-medium text-gray-700 dark:text-gray-300">
            GPS Coordinates
          </label>
          <button
            type="button"
            onClick={captureGPS}
            disabled={isLoadingGPS}
            className="bg-gray-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoadingGPS ? 'Getting location...' : 'Capture GPS'}
          </button>
        </div>
        {formData.latitude && formData.longitude ? (
          <div className="grid grid-cols-1 gap-2 text-base text-gray-600 sm:grid-cols-2 dark:text-gray-400">
            <div>Lat: {formData.latitude.toFixed(6)}</div>
            <div>Lng: {formData.longitude.toFixed(6)}</div>
            {formData.altitude !== null && <div>Alt: {formData.altitude.toFixed(1)}m</div>}
            {formData.accuracy !== null && <div>Accuracy: {formData.accuracy.toFixed(1)}m</div>}
          </div>
        ) : (
          <p className="text-base text-gray-500 dark:text-gray-400">
            No GPS coordinates captured
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 border border-gray-300 px-5 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canProceed}
          className="flex-1 bg-blue-600 px-5 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
