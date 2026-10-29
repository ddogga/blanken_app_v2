// ISO 시각 문자열 → 'YYYY.MM.DD' (기기 로컬 시간 기준)
export const formatDate = (iso: string): string => {
  const date = new Date(iso)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${mm}.${dd}`
}
