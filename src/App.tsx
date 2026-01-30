import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { NetworkStatus } from './components/NetworkStatus'
import { Login } from './pages/Login'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { SurveyWizard } from './pages/SurveyWizard'
import { SurveyDetail } from './pages/SurveyDetail'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey/new"
              element={
                <ProtectedRoute>
                  <SurveyWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey/:id"
              element={
                <ProtectedRoute>
                  <SurveyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey/:id/edit"
              element={
                <ProtectedRoute>
                  <SurveyWizard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <NetworkStatus />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
