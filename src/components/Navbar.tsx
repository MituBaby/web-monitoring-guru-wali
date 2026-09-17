import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, LogIn, UserPlus, Home, LayoutDashboard, LogOut, User, Users, BookOpen, KeyRound, AlertCircle, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);

  // Cek Status Siswa (Data Diri & Keanggotaan Grup)
  useEffect(() => {
    async function checkStudentStatus() {
      if (!user || profile?.role !== 'STUDENT') return;

      // 1. Cek apakah sudah kelola data diri
      const { data: profData } = await supabase
        .from('student_profiles')
        .select('is_completed')
        .eq('id', user.id)
        .single();

      setHasProfile(!!profData?.is_completed);

      // 2. Cek apakah sudah join grup
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      setHasGroup((count || 0) > 0);
    }

    checkStudentStatus();
  }, [user, profile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Monitoring Guru Wali
            </span>
          </Link>

          {/* Navigasi Menu */}
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md transition"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>

            {/* JIKA USER SUDAH LOGIN */}
            {user ? (
              <>
                {/* NAVIGASI GURU */}
                {profile?.role === 'TEACHER' ? (
                  <>
                    <Link
                      to="/teacher/dashboard"
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/teacher/groups"
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md transition"
                    >
                      <Users className="w-4 h-4" />
                      <span>Kelola Kelompok</span>
                    </Link>
                    <Link
                      to="/teacher/sessions"
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md transition"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Sesi Survei Jumat</span>
                    </Link>
                  </>
                ) : (
                  /* NAVIGASI SISWA */
                  <>
                    {!hasProfile ? (
                      /* Kondisi 1: Belum Isi Data Diri */
                      <Link
                        to="/student/profile-setup"
                        className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 px-3 py-2 rounded-lg shadow-sm transition animate-pulse"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Lengkapi Data Diri</span>
                      </Link>
                    ) : !hasGroup ? (
                      /* Kondisi 2: Belum Join Grup */
                      <Link
                        to="/student/join-group"
                        className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-lg shadow-sm transition"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Masukkan Kode Bimbingan</span>
                      </Link>
                    ) : (
                      /* Kondisi 3: Sudah Aktif di Grup */
                      <>
                        <Link
                          to="/student/dashboard"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md transition"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard Siswa</span>
                        </Link>
                        <Link
                          to="/student/materi"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md transition"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Materi Monitoring</span>
                        </Link>
                      </>
                    )}
                  </>
                )}

                <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

                {/* Info Profil Singkat */}
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{profile?.full_name || user.email}</span>
                  <span className="bg-indigo-200 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded">
                    {profile?.role === 'TEACHER' ? 'Guru' : 'Siswa'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              /* JIKA BELUM LOGIN */
              <>
                <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>
                <Link
                  to="/auth/login"
                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-md transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
                <Link
                  to="/auth/register"
                  className="flex items-center gap-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar</span>
                </Link>
              </>
            )}
          </nav>

        </div>
      </div>
    </header>
  );
}