import { create } from 'zustand'

// Access Token은 메모리에만 둔다. 브라우저 저장소에 저장하지 않는다
type AuthState = {
  accessToken: string | null
  setAccessToken: (accessToken: string) => void
  clearAccessToken: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAccessToken: () => set({ accessToken: null }),
}))
