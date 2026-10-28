import SocialLoginButton from '../components/SocialLoginButton'

function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-black px-6 text-white">
      <section className="flex flex-1 items-center justify-center">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
          blanken
        </h1>
      </section>

      <section className="mx-auto flex w-full max-w-sm flex-col gap-3 pb-16">
        <SocialLoginButton provider="kakao" />
        <SocialLoginButton provider="naver" />
      </section>
    </main>
  )
}

export default LoginPage
