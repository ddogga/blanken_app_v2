// 문장을 단어/그 밖의 문자로 나누고, 빈칸으로 만들 단어를 다룬다

// 서버로 보내는 문장에서 빈칸 자리를 나타내는 표시
export const BLANK_PLACEHOLDER = '{{}}'

export type SentenceToken = {
  text: string
  isWord: boolean // 빈칸으로 만들 수 있는 단어인지
  start: number // 문장 안에서 시작 위치
}

// 영어 단어. don't, well-known 처럼 ' 와 - 로 이어진 단어는 하나로 본다
const WORD_PATTERN = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g

export const tokenizeSentence = (sentence: string): SentenceToken[] => {
  const tokens: SentenceToken[] = []
  let last = 0
  for (const match of sentence.matchAll(WORD_PATTERN)) {
    if (match.index > last) {
      tokens.push({
        text: sentence.slice(last, match.index),
        isWord: false,
        start: last,
      })
    }
    tokens.push({ text: match[0], isWord: true, start: match.index })
    last = match.index + match[0].length
  }
  if (last < sentence.length) {
    tokens.push({ text: sentence.slice(last), isWord: false, start: last })
  }
  return tokens
}

// 빈칸으로 고른 단어 하나. 같은 단어가 여러 번 나오면 몇 번째인지(0부터)로 구분한다.
// 위치(인덱스) 대신 이 값으로 기억해서, 앞쪽 문장을 고쳐도 선택이 유지된다.
export type Blank = {
  text: string
  occurrence: number
}

const isSameBlank = (a: Blank, b: Blank): boolean =>
  a.text === b.text && a.occurrence === b.occurrence

const toBlank = (tokens: SentenceToken[], tokenIndex: number): Blank | null => {
  const token = tokens[tokenIndex]
  if (!token?.isWord) return null
  const occurrence = tokens
    .slice(0, tokenIndex)
    .filter((t) => t.isWord && t.text === token.text).length
  return { text: token.text, occurrence }
}

const findBlankIndex = (
  tokens: SentenceToken[],
  blank: Blank,
): number | null => {
  let seen = 0
  for (const [index, token] of tokens.entries()) {
    if (!token.isWord || token.text !== blank.text) continue
    if (seen === blank.occurrence) return index
    seen += 1
  }
  return null
}

// 빈칸인 토큰의 위치들 (문장 순서)
export const getBlankIndexes = (
  tokens: SentenceToken[],
  blanks: Blank[],
): number[] =>
  blanks
    .map((blank) => findBlankIndex(tokens, blank))
    .filter((index) => index !== null)
    .sort((a, b) => a - b)

// 문장 순서대로 정렬하고 중복을 없앤다
const normalizeBlanks = (tokens: SentenceToken[], blanks: Blank[]): Blank[] =>
  [...new Set(getBlankIndexes(tokens, blanks))]
    .map((index) => toBlank(tokens, index))
    .filter((blank) => blank !== null)

// 단어를 누르면 빈칸에 넣고, 이미 빈칸이면 뺀다
export const toggleBlank = (
  sentence: string,
  blanks: Blank[],
  tokenIndex: number,
): Blank[] => {
  const tokens = tokenizeSentence(sentence)
  const target = toBlank(tokens, tokenIndex)
  if (target === null) return blanks
  const exists = blanks.some((blank) => isSameBlank(blank, target))
  return normalizeBlanks(
    tokens,
    exists
      ? blanks.filter((blank) => !isSameBlank(blank, target))
      : [...blanks, target],
  )
}

// 문장이 바뀐 뒤에도 선택한 단어가 남아 있으면 유지한다.
// n번째가 사라졌으면 아직 고르지 않은 같은 단어 중 첫 번째로, 단어가 아예 없어졌으면 뺀다.
export const resolveBlanks = (sentence: string, blanks: Blank[]): Blank[] => {
  const tokens = tokenizeSentence(sentence)
  const kept = blanks.filter((blank) => findBlankIndex(tokens, blank) !== null)
  const lost = blanks.filter((blank) => findBlankIndex(tokens, blank) === null)
  for (const blank of lost) {
    for (let occurrence = 0; ; occurrence += 1) {
      const candidate = { text: blank.text, occurrence }
      if (findBlankIndex(tokens, candidate) === null) break
      if (kept.some((k) => isSameBlank(k, candidate))) continue
      kept.push(candidate)
      break
    }
  }
  return normalizeBlanks(tokens, kept)
}

// 정답 목록 (문장 순서)
export const getAnswers = (sentence: string, blanks: Blank[]): string[] => {
  const tokens = tokenizeSentence(sentence)
  return getBlankIndexes(tokens, blanks).map((index) => tokens[index].text)
}

export type SentencePart = { type: 'text'; text: string } | { type: 'blank' }

// 빈칸을 기준으로 나눈 문장. 학습 화면 미리보기에 쓴다
export const splitByBlanks = (
  sentence: string,
  blanks: Blank[],
): SentencePart[] => {
  const tokens = tokenizeSentence(sentence)
  const blankIndexes = new Set(getBlankIndexes(tokens, blanks))
  const parts: SentencePart[] = []
  for (const [index, token] of tokens.entries()) {
    const last = parts.at(-1)
    if (blankIndexes.has(index)) parts.push({ type: 'blank' })
    else if (last?.type === 'text') last.text += token.text
    else parts.push({ type: 'text', text: token.text })
  }
  return parts
}

// 서버로 보낼 문장: 빈칸 자리를 {{}}로 바꾼다
export const toBlankedSentence = (sentence: string, blanks: Blank[]): string =>
  splitByBlanks(sentence, blanks)
    .map((part) => (part.type === 'blank' ? BLANK_PLACEHOLDER : part.text))
    .join('')

// 서버에서 받은 문장({{}} 포함)과 정답들로 원래 문장과 빈칸 선택을 되살린다.
// 정답이 단어 하나로 나뉘지 않는 빈칸(여러 단어 등)은 문장에만 넣고 선택하지 않는다
export const fromBlankedSentence = (
  blankedSentence: string,
  answers: string[],
): { sentence: string; blanks: Blank[] } => {
  const pieces = blankedSentence.split(BLANK_PLACEHOLDER)
  let sentence = pieces[0]
  const answerStarts: number[] = []
  for (const [i, piece] of pieces.slice(1).entries()) {
    const answer = answers[i] ?? ''
    answerStarts.push(sentence.length)
    sentence += answer + piece
  }
  const tokens = tokenizeSentence(sentence)
  const blanks = answerStarts
    .map((start, i) => {
      const index = tokens.findIndex(
        (t) => t.isWord && t.start === start && t.text === answers[i],
      )
      return index < 0 ? null : toBlank(tokens, index)
    })
    .filter((blank) => blank !== null)
  return { sentence, blanks }
}
