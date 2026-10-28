// 앱 밖 주소로 전체 페이지 이동. RN 전환 시 이 파일만 교체한다
export const openExternal = async (url: string): Promise<void> => {
  window.location.href = url
}
