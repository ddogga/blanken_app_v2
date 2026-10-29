import axios from 'axios'
import type { ErrorResponse } from '../types/error'

export type ApiError = {
  status: number | null // 응답이 없으면(네트워크 오류 등) null
  body: ErrorResponse | null
}

const isErrorResponse = (data: unknown): data is ErrorResponse =>
  typeof data === 'object' &&
  data !== null &&
  typeof (data as { code?: unknown }).code === 'string' &&
  typeof (data as { message?: unknown }).message === 'string'

export const toApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error)) return { status: null, body: null }
  const data: unknown = error.response?.data
  return {
    status: error.response?.status ?? null,
    body: isErrorResponse(data) ? data : null,
  }
}
