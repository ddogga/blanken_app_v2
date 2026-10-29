import { getUserIdFromAccessToken } from '../domain/auth'
import { useAuthStore } from '../stores/authStore'

// 로그인한 사용자의 userId (Access Token의 sub). 토큰이 없으면 null
export function useMyUserId(): number | null {
  const accessToken = useAuthStore((state) => state.accessToken)
  return accessToken === null ? null : getUserIdFromAccessToken(accessToken)
}
