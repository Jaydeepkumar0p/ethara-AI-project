import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar/Navbar'
import useAuthStore from './store/authStore'
import { LoginPage, RegisterPage } from './pages/Auth'

const HomePage = lazy(() => import('./pages/Home'))
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const ProjectsPage = lazy(() => import('./pages/Projects'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetail'))
const TasksPage = lazy(() => import('./pages/Tasks'))
const ProfilePage = lazy(() => import('./pages/Profile'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', animation: 'float 2s ease-in-out infinite' }}>⚡</div>
      <div className="loading loading-dots loading-md text-primary" />
    </div>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

const PT = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
  >{children}</motion.div>
)

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
    <div className="text-7xl mb-6">🌌</div>
    <h1 className="font-display text-4xl font-bold mb-3">404 · Lost in space</h1>
    <p className="text-base-content/50 mb-8">This page doesn't exist.</p>
    <a href="/" className="px-6 py-3 rounded-xl text-white font-semibold"
      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Go Home →</a>
  </div>
)

const AppRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PT><HomePage /></PT>} />
          <Route path="/login" element={<PublicRoute><PT><LoginPage /></PT></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><PT><RegisterPage /></PT></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><PT><DashboardPage /></PT></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><PT><ProjectsPage /></PT></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><PT><ProjectDetailPage /></PT></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><PT><TasksPage /></PT></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PT><ProfilePage /></PT></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-100 text-base-content font-body">
        <Navbar />
        <AppRoutes />
        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              padding: '10px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0f172a' } }
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
