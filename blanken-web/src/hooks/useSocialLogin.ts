import { getSocialLoginUrl } from '../api/auth'
import { openExternal } from '../platform/navigation'
import type { SocialProvider } from '../types/auth'

export function useSocialLogin() {
  const startLogin = (provider: SocialProvider) => {
    void openExternal(getSocialLoginUrl(provider))
  }

  return { startLogin }
}
