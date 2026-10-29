import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'
import type { TokenResponse } from '../types/auth'
import { API_BASE_URL } from './config'
import { toApiError } from './error'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Refresh Token은 1회용(Rotation)이라 동시에 두 번 호출하면 두 번째가 실패한다.
// 진행 중인 요청이 있으면 새로 보내지 않고 같은 Promise를 돌려준다.
let refreshPromise: Promise<TokenResponse> | null = null

export const refreshAccessToken = (): Promise<TokenResponse> => {
  refreshPromise ??= apiClient
    .post<TokenResponse>('/auth/refresh', null, { withCredentials: true })
    .then((res) => {
      useAuthStore.getState().setAccessToken(res.data.accessToken)
      return res.data
    })
    .catch((error: unknown) => {
      useAuthStore.getState().clearAccessToken()
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// 모든 요청에 Access Token을 붙인다
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

// TOKEN_EXPIRED면 재발급 후 원래 요청을 1회 재시도한다.
// 그 밖의 401/403은 그대로 에러로 넘기고, 화면 이동은 호출한 쪽에서 정한다.
apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.config) throw error

  const config: RetryableConfig = error.config
  const { status, body } = toApiError(error)
  if (status !== 401 || body?.code !== 'TOKEN_EXPIRED' || config._retried) {
    throw error
  }

  config._retried = true
  const token = await refreshAccessToken()
  config.headers.Authorization = `Bearer ${token.accessToken}`
  return apiClient(config)
})
