import type { SocialProvider } from '../types/auth'
import { OAUTH_BASE_URL } from './config'

// fetch/axios로 호출하지 않고 이 주소로 전체 페이지 이동한다
export const getSocialLoginUrl = (provider: SocialProvider): string =>
  `${OAUTH_BASE_URL}/oauth2/authorization/${provider}`
