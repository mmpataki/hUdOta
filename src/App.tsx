import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { Layout } from './components/Layout'
import { PublicPlaylist } from './components/PublicPlaylist'

function AuthGate() {
  const { isSignedIn, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
      </div>
    )
  }
  return isSignedIn ? <Layout /> : <Login />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/public/:spreadsheetId" element={<PublicPlaylist />} />
        <Route
          path="*"
          element={
            <AuthProvider>
              <AuthGate />
            </AuthProvider>
          }
        />
      </Routes>
    </HashRouter>
  )
}
