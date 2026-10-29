export type SocialProvider = 'kakao' | 'naver'

// 서버 UserRole. Access Token(JWT)의 role 클레임 값
export type UserRole = 'GUEST' | 'USER' | 'ADMIN'

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
