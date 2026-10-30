import { useRef, useState } from 'react'
import {
  changeSentence,
  createEmptyDraft,
  fromQuizResponse,
  moveDraft,
  toggleBlankAt,
  type QuizDraft,
} from '../domain/quizDraft'
import type { QuizResponse } from '../types/quiz'

// 수정 화면의 퀴즈 목록 편집 상태. 서버 저장은 아직 하지 않는다
// initialQuizzes는 처음 한 번만 쓴다
export function useQuizDrafts(initialQuizzes: QuizResponse[]) {
  // 저장된 퀴즈는 id로, 새로 추가한 퀴즈는 증가하는 번호로 key를 만든다
  const nextKey = useRef(0)
  const [drafts, setDrafts] = useState<QuizDraft[]>(() =>
    initialQuizzes.map((quiz) => fromQuizResponse(`saved-${quiz.id}`, quiz)),
  )
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const update = (key: string, change: (draft: QuizDraft) => QuizDraft) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? change(d) : d)))
  }

  const removeKeys = (keys: ReadonlySet<string>) => {
    setDrafts((prev) => prev.filter((d) => !keys.has(d.key)))
    setSelectedKeys((prev) => new Set([...prev].filter((k) => !keys.has(k))))
  }

  const allSelected =
    drafts.length > 0 && drafts.every((d) => selectedKeys.has(d.key))

  return {
    drafts,
    addQuiz: () => {
      const key = `new-${nextKey.current++}`
      setDrafts((prev) => [...prev, createEmptyDraft(key)])
    },
    setSentence: (key: string, sentence: string) =>
      update(key, (d) => changeSentence(d, sentence)),
    toggleBlank: (key: string, tokenIndex: number) =>
      update(key, (d) => toggleBlankAt(d, tokenIndex)),
    setTranslation: (key: string, translation: string) =>
      update(key, (d) => ({ ...d, translation })),
    setHint: (key: string, hint: string) =>
      update(key, (d) => ({ ...d, hint })),
    removeQuiz: (key: string) => removeKeys(new Set([key])),
    // key 퀴즈를 targetKey 퀴즈가 있던 자리로 옮긴다 (드래그 앤 드롭)
    moveQuiz: (key: string, targetKey: string) =>
      setDrafts((prev) =>
        moveDraft(
          prev,
          prev.findIndex((d) => d.key === key),
          prev.findIndex((d) => d.key === targetKey),
        ),
      ),

    selectedKeys,
    selectedCount: selectedKeys.size,
    allSelected,
    toggleSelect: (key: string) =>
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      }),
    toggleSelectAll: () =>
      setSelectedKeys(
        allSelected ? new Set() : new Set(drafts.map((d) => d.key)),
      ),
    removeSelected: () => removeKeys(selectedKeys),
  }
}
