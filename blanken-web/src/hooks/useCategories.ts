import type { CategoryResponse } from '../types/quizSet'

// TODO: 카테고리 조회 API가 생기면 useQuery로 교체한다. 지금은 화면 확인용 샘플 데이터
const SAMPLE_CATEGORIES: CategoryResponse[] = [
  { id: 1, name: '일상 회화' },
  { id: 2, name: '비즈니스' },
  { id: 3, name: '여행' },
  { id: 4, name: '시험 대비' },
]

export function useCategories() {
  return { categories: SAMPLE_CATEGORIES }
}
