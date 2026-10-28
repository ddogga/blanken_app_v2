import { Navigate, Route, Routes } from 'react-router'
import SplashScreen from './components/SplashScreen'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {
  const authStatus = useAuthBootstrap()

  // refresh 결과가 나오기 전에는 라우트를 판단하지 않는다
  if (authStatus === 'pending') return <SplashScreen />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* 메인 화면과 로그인 가드가 생기기 전까지는 로그인 화면으로 보낸다 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
