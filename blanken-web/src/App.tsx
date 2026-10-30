import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import RequireAnonymous from './components/RequireAnonymous'
import RequireAuth from './components/RequireAuth'
import SplashScreen from './components/SplashScreen'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import ComingSoonPage from './pages/ComingSoonPage'
import LoginPage from './pages/LoginPage'
import MyQuizSetsPage from './pages/MyQuizSetsPage'
import SignupPage from './pages/SignupPage'

function App() {
  const authStatus = useAuthBootstrap()

  // refresh 결과가 나오기 전에는 라우트를 판단하지 않는다
  if (authStatus === 'pending') return <SplashScreen />

  return (
    <Routes>
      <Route element={<RequireAnonymous />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<MyQuizSetsPage />} />
          <Route
            path="history"
            element={<ComingSoonPage title="학습 히스토리" />}
          />
          <Route path="social" element={<ComingSoonPage title="소셜" />} />
          <Route
            path="quiz-sets/:quizSetId/edit"
            element={<ComingSoonPage title="퀴즈셋 수정" />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
