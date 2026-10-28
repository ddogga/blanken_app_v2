import { useQuery } from '@tanstack/react-query'
import { refreshAccessToken } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

export type AuthBootstrapStatus =
  'pending' | 'authenticated' | 'unauthenticated'

// 앱 시작 시 /auth/refresh로 Access Token을 받아 스토어에 저장한다
export function useAuthBootstrap(): AuthBootstrapStatus {
  const { status } = useQuery({
    queryKey: ['auth', 'bootstrap'],
    queryFn: async () => {
      try {
        const token = await refreshAccessToken()
        useAuthStore.getState().setAccessToken(token.accessToken)
        return token
      } catch (error) {
        useAuthStore.getState().clearAccessToken()
        throw error
      }
    },
    // 호출할 때마다 Refresh Token이 교체되므로 앱 시작 시 한 번만 호출한다
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (status === 'pending') return 'pending'
  return status === 'success' ? 'authenticated' : 'unauthenticated'
}
