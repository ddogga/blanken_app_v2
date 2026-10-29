import { useState } from 'react'
import {
  EMPTY_QUIZ_SET_FORM,
  canSubmitQuizSetForm,
  getTrimmedLength,
  validateQuizSetDescription,
  validateQuizSetTitle,
  type QuizSetFormValues,
} from '../domain/quizSetForm'

export function useQuizSetForm() {
  const [values, setValues] = useState<QuizSetFormValues>(EMPTY_QUIZ_SET_FORM)

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
  }
}
