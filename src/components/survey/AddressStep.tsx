import { useEffect, useState } from 'react'
import { useSurveyWizard } from '../../contexts/SurveyWizardContext'
import { TextInput } from '../ui/TextInput'
import { SelectInput } from '../ui/SelectInput'
import { getProvinces, getDistricts, getMunicipalities } from '../../lib/addressCache'

export function AddressStep() {
  const { formData, updateFormData, nextStep, prevStep } = useSurveyWizard()

  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<string[]>([])
  const [isLoadingGPS, setIsLoadingGPS] = useState(false)

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

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Address Information
      </h2>

      <SelectInput
        label="Province"
        options={provinces.map((p) => ({ value: p, label: p }))}
        value={formData.province}
        onChange={(v) => updateFormData({ province: v, district: '', municipality: '' })}
        required
      />

      <SelectInput
        label="District"
        options={districts.map((d) => ({ value: d, label: d }))}
        value={formData.district}
        onChange={(v) => updateFormData({ district: v, municipality: '' })}
        required
        disabled={!formData.province}
      />

      <SelectInput
        label="Municipality/City"
        options={municipalities.map((m) => ({ value: m, label: m }))}
        value={formData.municipality}
        onChange={(v) => updateFormData({ municipality: v })}
        required
        disabled={!formData.district}
      />

      <TextInput
        label="Barangay"
        value={formData.barangay}
        onChange={(v) => updateFormData({ barangay: v })}
        required
      />

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
