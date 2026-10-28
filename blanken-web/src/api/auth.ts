import type { SocialProvider, TokenResponse } from '../types/auth'
import { apiClient } from './client'
import { OAUTH_BASE_URL } from './config'

// fetch/axios로 호출하지 않고 이 주소로 전체 페이지 이동한다
export const getSocialLoginUrl = (provider: SocialProvider): string =>
  `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`

// Refresh Token은 1회용(Rotation)이라 동시에 두 번 호출하면 두 번째가 실패한다.
// 진행 중인 요청이 있으면 새로 보내지 않고 같은 Promise를 돌려준다.
let refreshPromise: Promise<TokenResponse> | null = null

export const refreshAccessToken = (): Promise<TokenResponse> => {
  refreshPromise ??= apiClient
    .post<TokenResponse>('/auth/refresh', null, { withCredentials: true })
    .then((res) => res.data)
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}
