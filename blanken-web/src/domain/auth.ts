import type { UserRole } from '../types/auth'

// anonymous: 토큰 없음 / guest: 가입 미완료(GUEST) / member: 가입 완료(USER, ADMIN)
export type AuthState = 'anonymous' | 'guest' | 'member'

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

// base64url → UTF-8 문자열. 브라우저 전용 atob에 의존하지 않도록 직접 구현한다
const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  let buffer = 0
  let bits = 0
  let encoded = ''
  for (const char of base64) {
    if (char === '=') break
    const index = BASE64_CHARS.indexOf(char)
    if (index === -1) throw new Error('잘못된 base64 문자')
    buffer = ((buffer << 6) | index) & 0xffff
    bits += 6
    if (bits >= 8) {
      bits -= 8
      encoded += `%${((buffer >> bits) & 0xff).toString(16).padStart(2, '0')}`
    }
  }
  return decodeURIComponent(encoded)
}

const isUserRole = (value: unknown): value is UserRole =>
  value === 'GUEST' || value === 'USER' || value === 'ADMIN'

// JWT payload의 role 클레임을 읽는다. 서명 검증은 서버가 하고, 여기서는 화면 분기에만 쓴다
export const getRoleFromAccessToken = (
  accessToken: string,
): UserRole | null => {
  const payloadPart = accessToken.split('.')[1]
  if (!payloadPart) return null
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(payloadPart))
    if (typeof payload !== 'object' || payload === null) return null
    const role: unknown = (payload as { role?: unknown }).role
    return isUserRole(role) ? role : null
  } catch {
    return null
  }
}

// 읽을 수 없는 토큰은 로그인하지 않은 것으로 본다
export const getAuthState = (accessToken: string | null): AuthState => {
  if (accessToken === null) return 'anonymous'
  const role = getRoleFromAccessToken(accessToken)
  if (role === 'GUEST') return 'guest'
  if (role === 'USER' || role === 'ADMIN') return 'member'
  return 'anonymous'
}
