import { useEffect, useRef } from 'react'
import { getLoginErrorMessage } from '../domain/loginError'
import { showAlert } from '../platform/dialog'

// errorCode가 있으면 안내 alert를 한 번 띄우고, 닫히면 onAlertClosed를 호출한다
export function useLoginErrorAlert(
  errorCode: string | null,
  onAlertClosed: () => void,
) {
  // 개발 모드(StrictMode)에서 effect가 두 번 실행돼도 alert는 한 번만 띄운다
  const handledCodeRef = useRef<string | null>(null)

  useEffect(() => {
    if (errorCode === null) {
      handledCodeRef.current = null
      return
    }
    if (handledCodeRef.current === errorCode) return
    handledCodeRef.current = errorCode

    void showAlert(getLoginErrorMessage(errorCode)).then(onAlertClosed)
  }, [errorCode, onAlertClosed])
}
