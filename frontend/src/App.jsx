import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx'
import PageTitle from './components/PageTitle.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Courses from './pages/Courses.jsx'
import CourseCurriculum from './pages/CourseCurriculum.jsx'
import Faculty from './pages/Faculty.jsx'
import FacultyDetail from './pages/FacultyDetail.jsx'
import Blog from './pages/Blog.jsx'
import BlogPost from './pages/BlogPost.jsx'
import Contact from './pages/Contact.jsx'
import Enroll from './pages/Enroll.jsx'
import NotFound from './pages/NotFound.jsx'

import StudentLogin from './pages/auth/StudentLogin.jsx'
import StudentSignup from './pages/auth/StudentSignup.jsx'
import AdminLogin from './pages/auth/AdminLogin.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'

import Dashboard from './pages/admin/Dashboard.jsx'
import Enquiries from './pages/admin/Enquiries.jsx'
import Posts from './pages/admin/Posts.jsx'
import ManageCourses from './pages/admin/ManageCourses.jsx'
import AdminFaculty from './pages/admin/AdminFaculty.jsx'
import Settings from './pages/admin/Settings.jsx'

function Public({ children }) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <>
      <PageTitle />
      <Routes>
        {/* Public marketing site */}
        <Route path="/" element={<Public><Home /></Public>} />
        <Route path="/about" element={<Public><About /></Public>} />
        <Route path="/courses" element={<Public><Courses /></Public>} />
        <Route path="/curriculum/:courseId" element={<Public><CourseCurriculum /></Public>} />
        <Route path="/faculty" element={<Public><Faculty /></Public>} />
        <Route path="/faculty/:facultyId" element={<Public><FacultyDetail /></Public>} />
        <Route path="/blog" element={<Public><Blog /></Public>} />
        <Route path="/blog/:postId" element={<Public><BlogPost /></Public>} />
        <Route path="/contact" element={<Public><Contact /></Public>} />
        <Route path="/enroll" element={<Public><Enroll /></Public>} />

        {/* Auth */}
        <Route path="/login" element={<PublicOnlyRoute role="STUDENT"><StudentLogin /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute role="STUDENT"><StudentSignup /></PublicOnlyRoute>} />
        <Route path="/admin/login" element={<PublicOnlyRoute role="ADMIN"><AdminLogin /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin dashboard (protected) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute role="ADMIN">
              <Enquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute role="ADMIN">
              <Posts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute role="ADMIN">
              <ManageCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminFaculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="ADMIN">
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Public><NotFound /></Public>} />
      </Routes>
    </>
  )
}
