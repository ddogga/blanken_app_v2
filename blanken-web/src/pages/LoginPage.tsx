import { useNavigate, useSearchParams } from 'react-router'
import SocialLoginButton from '../components/SocialLoginButton'
import { useLoginErrorAlert } from '../hooks/useLoginErrorAlert'
import { useSocialLogin } from '../hooks/useSocialLogin'

function LoginPage() {
  const { startLogin } = useSocialLogin()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // alert를 닫으면 ?error=를 지운 /login으로 이동한다 (새로고침 시 다시 뜨지 않도록)
  useLoginErrorAlert(searchParams.get('error'), () =>
    navigate('/login', { replace: true }),
  )

  return (
    <main className="flex min-h-dvh flex-col bg-black px-6 text-white">
      <section className="flex flex-1 items-center justify-center">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
          blankEN
        </h1>
      </section>

      <section className="mx-auto flex w-full max-w-sm flex-col gap-3 pb-16">
        <SocialLoginButton
          provider="kakao"
          onClick={() => startLogin('kakao')}
        />
        <SocialLoginButton
          provider="naver"
          onClick={() => startLogin('naver')}
        />
      </section>
    </main>
  )
}

export default LoginPage
