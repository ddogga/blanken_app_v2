import type { SignupRequest, TokenResponse } from '../types/auth'
import { apiClient } from './client'

// GUEST 토큰으로만 호출할 수 있다. 성공 시 USER 권한 토큰을 돌려준다
export const signup = async (
  request: SignupRequest,
): Promise<TokenResponse> => {
  const res = await apiClient.post<TokenResponse>('/api/users/signup', request)
  return res.data
}
