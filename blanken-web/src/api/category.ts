import type { CategoryResponse } from '../types/quizSet'
import { apiClient } from './client'

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const res = await apiClient.get<CategoryResponse[]>('/api/categories')
  return res.data
}
