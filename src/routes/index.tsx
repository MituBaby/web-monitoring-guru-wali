import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherGroups from '../pages/teacher/Groups';
import TeacherSessions from '../pages/teacher/Sessions';
import SessionAnalytics from '../pages/teacher/Analytics';
import StudentDetail from '../pages/teacher/StudentDetail'; // Impor StudentDetail
import StudentDashboard from '../pages/student/Dashboard';
import StudentProfileSetup from '../pages/student/ProfileSetup';
import JoinGroup from '../pages/student/JoinGroup';
import StudentMateri from '../pages/student/Materi';
import TakeTest from '../pages/student/TakeTest';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Landing />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="auth/register" element={<Register />} />

        {/* Teacher Service Routes */}
        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="teacher/groups" element={<TeacherGroups />} />
        <Route path="teacher/groups/:groupId/students/:studentId" element={<StudentDetail />} /> {/* Route Detail Siswa */}
        <Route path="teacher/sessions" element={<TeacherSessions />} />
        <Route path="teacher/sessions/:sessionId/analytics" element={<SessionAnalytics />} />

        {/* Student Service Routes */}
        <Route path="student/dashboard" element={<StudentDashboard />} />
        <Route path="student/profile-setup" element={<StudentProfileSetup />} />
        <Route path="student/join-group" element={<JoinGroup />} />
        <Route path="student/materi" element={<StudentMateri />} />
        <Route path="student/test/:sessionId/:testType" element={<TakeTest />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-800">404 - Halaman Tidak Ditemukan</h2>
            <p className="text-slate-500 mt-2">Maaf, halaman yang Anda cari tidak tersedia.</p>
          </div>
        } />
      </Route>
    </Routes>
  );
}