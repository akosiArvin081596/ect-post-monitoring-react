export type SurveyorDevice = 'Mobile' | 'Tablet' | 'Desktop'

const TABLET_MIN_WIDTH = 768

export function detectDevice(): SurveyorDevice {
  if (typeof window === 'undefined') return 'Desktop'

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const width = window.innerWidth

  if (!coarsePointer) return 'Desktop'
  return width >= TABLET_MIN_WIDTH ? 'Tablet' : 'Mobile'
}
