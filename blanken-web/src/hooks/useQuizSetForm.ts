import { useState } from 'react'
import {
  EMPTY_QUIZ_SET_FORM,
  canSubmitQuizSetForm,
  getTrimmedLength,
  toCreateQuizSetRequest,
  validateQuizSetDescription,
  validateQuizSetTitle,
  type QuizSetFormValues,
} from '../domain/quizSetForm'

// initialValues는 처음 한 번만 쓴다 (수정 화면에서 기존 값으로 채울 때)
export function useQuizSetForm(
  initialValues: QuizSetFormValues = EMPTY_QUIZ_SET_FORM,
) {
  const [values, setValues] = useState<QuizSetFormValues>(initialValues)

  const setField = <K extends keyof QuizSetFormValues>(
    key: K,
    value: QuizSetFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return {
    values,
    setTitle: (title: string) => setField('title', title),
    setDescription: (description: string) =>
      setField('description', description),
    setCategoryId: (categoryId: number | null) =>
      setField('categoryId', categoryId),
    toggleVisibility: () =>
      setField(
        'visibility',
        values.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC',
      ),
    titleLength: getTrimmedLength(values.title),
    descriptionLength: getTrimmedLength(values.description),
    // 아무것도 입력하지 않은 처음 상태에서는 에러를 보여주지 않는다
    titleError: values.title === '' ? null : validateQuizSetTitle(values.title),
    descriptionError: validateQuizSetDescription(values.description),
    canSubmit: canSubmitQuizSetForm(values),
    buildRequest: (ownerId: number) => toCreateQuizSetRequest(values, ownerId),
  }
}
