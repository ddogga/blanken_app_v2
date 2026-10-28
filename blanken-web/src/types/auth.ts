export type SocialProvider = 'kakao' | 'naver'

export type SignupRequest = {
  nickname: string
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeMarketing: boolean
}

// POST /auth/refresh, POST /api/users/signup 성공 응답
export type TokenResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
}
