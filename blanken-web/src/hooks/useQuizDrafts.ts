import { useRef, useState } from 'react'
import {
  changeSentence,
  createEmptyDraft,
  moveDraft,
  toggleBlankAt,
  type QuizDraft,
} from '../domain/quizDraft'

// 수정 화면의 퀴즈 목록 편집 상태. initialDrafts는 처음 한 번만 쓴다
export function useQuizDrafts(initialDrafts: QuizDraft[]) {
  // 새로 추가한 퀴즈는 증가하는 번호로 key를 만든다 (저장된 퀴즈는 saved-{id})
  const nextKey = useRef(0)
  const [drafts, setDrafts] = useState<QuizDraft[]>(initialDrafts)
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
