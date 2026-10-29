type Props = {
  title: string
}

// 아직 만들지 않은 메뉴의 임시 화면
function ComingSoonPage({ title }: Props) {
  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-16 text-center text-neutral-500">
        준비 중인 화면이에요.
      </p>
    </section>
  )
}

export default ComingSoonPage
