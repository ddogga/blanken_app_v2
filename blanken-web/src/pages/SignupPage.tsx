import AgreementCheckbox from '../components/AgreementCheckbox'
import { NICKNAME_MAX_LENGTH, type AgreementKey } from '../domain/signup'
import { useSignupForm } from '../hooks/useSignupForm'

const AGREEMENT_ITEMS: {
  key: AgreementKey
  label: string
  tag: '필수' | '선택'
}[] = [
  { key: 'agreeTerms', label: '서비스 이용약관 동의', tag: '필수' },
  { key: 'agreePrivacy', label: '개인정보 수집·이용 동의', tag: '필수' },
  { key: 'agreeMarketing', label: '마케팅 정보 수신 동의', tag: '선택' },
]

function SignupPage() {
  const form = useSignupForm()

  return (
    <main className="flex min-h-dvh flex-col bg-black px-6 text-white">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto flex w-full max-w-sm flex-1 flex-col pt-14 pb-10"
      >
        <p className="text-xl font-extrabold tracking-tight">blankEN</p>
        <h1 className="mt-8 text-2xl leading-snug font-bold">
          반가워요!
          <br />
          사용할 닉네임을 정해 주세요
        </h1>

        <label htmlFor="nickname" className="mt-10 text-sm text-neutral-400">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          value={form.nickname}
          onChange={(e) => form.setNickname(e.target.value)}
          placeholder="2~20자로 입력해 주세요"
          autoComplete="off"
          className={`mt-2 h-12 rounded-xl border bg-neutral-900 px-4 text-base outline-none placeholder:text-neutral-600 ${
            form.nicknameError
              ? 'border-red-400'
              : 'border-neutral-800 focus:border-white'
          }`}
        />
        <div className="mt-2 flex justify-between gap-4 text-xs">
          <span className="text-red-400">{form.nicknameError}</span>
          <span className="shrink-0 text-neutral-500">
            {form.nicknameLength}/{NICKNAME_MAX_LENGTH}
          </span>
        </div>

        <div className="mt-10 rounded-xl border border-neutral-800 px-4 py-2">
          <AgreementCheckbox
            label="약관 전체 동의"
            checked={form.allAgreed}
            onChange={form.toggleAll}
            emphasized
          />
          <div className="my-2 border-t border-neutral-800" />
          {AGREEMENT_ITEMS.map((item) => (
            <AgreementCheckbox
              key={item.key}
              label={item.label}
              tag={item.tag}
              checked={form.agreements[item.key]}
              onChange={() => form.toggleAgreement(item.key)}
            />
          ))}
        </div>

        <div className="mt-auto pt-10">
          <button
            type="submit"
            disabled={!form.canSubmit}
            className="h-12 w-full rounded-xl bg-white font-semibold text-black transition-opacity active:opacity-80 disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            가입하기
          </button>
        </div>
      </form>
    </main>
  )
}

export default SignupPage
