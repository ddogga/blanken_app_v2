export type SocialProvider = 'kakao' | 'naver'

export type SignupRequest = {
  nickname: string
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeMarketing: boolean
}
