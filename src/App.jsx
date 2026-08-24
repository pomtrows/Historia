import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import LessonPage from './pages/LessonPage'
import QuizWidget from './components/Course/QuizWidget'
import AnnexViewer from './components/Course/AnnexViewer'
import VideoViewer from './components/Course/VideoViewer'
import TimelinePage from './pages/TimelinePage'
import AdminPanel from './pages/AdminPanel'
import AuthPage from './pages/AuthPage'
import CoursesPage from './pages/CoursesPage'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/lesson/:id" element={<LessonPage />} />
              <Route path="/lesson/:id/frise" element={<TimelinePage />} />
              <Route path="/lesson/:id/quiz" element={<QuizWidget />} />
              <Route path="/lesson/:id/annex" element={<AnnexViewer />} />
              <Route path="/lesson/:id/video" element={<VideoViewer />} />
              
              {/* Routes Administrateur unifiées */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
              <Route path="/admin/editor" element={<Navigate to="/admin?tab=lesson" replace />} />
              <Route path="/admin/quiz" element={<Navigate to="/admin?tab=quiz" replace />} />
              <Route path="/admin/annexes" element={<Navigate to="/admin?tab=art" replace />} />
              <Route path="/admin/videos" element={<Navigate to="/admin?tab=video" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
