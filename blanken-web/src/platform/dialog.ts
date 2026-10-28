// 사용자가 확인을 누르면 resolve된다. RN 전환 시 Alert.alert 구현으로 교체한다
export const showAlert = async (message: string): Promise<void> => {
  window.alert(message)
}
