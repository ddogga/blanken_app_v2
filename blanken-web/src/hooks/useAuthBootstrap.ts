import { useQuery } from '@tanstack/react-query'
import { refreshAccessToken } from '../api/client'

export type AuthBootstrapStatus =
  'pending' | 'authenticated' | 'unauthenticated'

// 앱 시작 시 /auth/refresh로 Access Token을 받는다 (스토어 저장은 refreshAccessToken이 한다)
export function useAuthBootstrap(): AuthBootstrapStatus {
  const { status } = useQuery({
    queryKey: ['auth', 'bootstrap'],
    queryFn: refreshAccessToken,
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
