import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitAssignment from './pages/student/SubmitAssignment';
import TakeExam from './pages/student/TakeExam';
import MyMarks from './pages/student/MyMarks';
import MySubmissions from './pages/student/MySubmissions';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateAssignment from './pages/teacher/CreateAssignment';
import CreateExam from './pages/teacher/CreateExam';
import ViewExams from './pages/teacher/ViewExams';
import ViewSubmissions from './pages/teacher/ViewSubmissions';
import ManageStudents from './pages/teacher/ManageStudents';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { background: '#1a1a2e', color: '#fff', border: '1px solid #667eea' }
        }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute role="student"><SubmitAssignment /></ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <ProtectedRoute role="student"><TakeExam /></ProtectedRoute>
          } />
          <Route path="/student/marks" element={
            <ProtectedRoute role="student"><MyMarks /></ProtectedRoute>
          } />
          <Route path="/student/submissions" element={
            <ProtectedRoute role="student"><MySubmissions /></ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
          } />
          <Route path="/teacher/create-assignment" element={
            <ProtectedRoute role="teacher"><CreateAssignment /></ProtectedRoute>
          } />
          <Route path="/teacher/create-exam" element={
            <ProtectedRoute role="teacher"><CreateExam /></ProtectedRoute>
          } />
          <Route path="/teacher/exams" element={
            <ProtectedRoute role="teacher"><ViewExams /></ProtectedRoute>
          } />
          <Route path="/teacher/submissions" element={
            <ProtectedRoute role="teacher"><ViewSubmissions /></ProtectedRoute>
          } />
          <Route path="/teacher/grade" element={<Navigate to="/teacher/exams" />} />
          <Route path="/teacher/students" element={
            <ProtectedRoute role="teacher"><ManageStudents /></ProtectedRoute>
          } />
          <Route path="/student/notifications" element={
  <ProtectedRoute role="student"><Notifications /></ProtectedRoute>
} />
<Route path="/student/settings" element={
  <ProtectedRoute role="student"><Settings /></ProtectedRoute>
} />
<Route path="/teacher/notifications" element={
  <ProtectedRoute role="teacher"><Notifications /></ProtectedRoute>
} />
<Route path="/teacher/settings" element={
  <ProtectedRoute role="teacher"><Settings /></ProtectedRoute>
} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
