// 서버 PageResponse<T>
export type PageResponse<T> = {
  content: T[]
  page: number // 0부터 시작
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
