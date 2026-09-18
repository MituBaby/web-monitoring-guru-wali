import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Users, PlayCircle, School, ArrowRight, Clock } from 'lucide-react';

interface DashboardStats {
  activeGroupCount: number;
  totalStudentCount: number;
  activeSessionCount: number;
  flaggedStudentCount: number;
}

interface RecentGroup {
  id: string;
  group_name: string;
  group_code: string;
  academic_year: string;
}

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeGroupCount: 0,
    totalStudentCount: 0,
    activeSessionCount: 0,
    flaggedStudentCount: 0,
  });
  const [recentGroups, setRecentGroups] = useState<RecentGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Ambil kelompok aktif milik guru
        const { data: groups } = await supabase
          .from('groups')
          .select('id, group_name, group_code, academic_year')
          .eq('teacher_id', user.id)
          .eq('status', 'ACTIVE');

        const activeGroupCount = groups?.length || 0;
        setRecentGroups(groups || []);

        // 2. Ambil total siswa binaan dari seluruh kelompok aktif guru
        let totalStudentCount = 0;
        if (groups && groups.length > 0) {
          const groupIds = groups.map((g) => g.id);
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .in('group_id', groupIds);

          totalStudentCount = count || 0;
        }

        // 3. Ambil total sesi survei jumat yang sedang aktif
        const { count: sessionCount } = await supabase
          .from('survey_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id)
          .eq('is_active', true);

        setStats({
          activeGroupCount,
          totalStudentCount,
          activeSessionCount: sessionCount || 0,
          flaggedStudentCount: 0, // Akan terhitung jika ada evaluasi
        });
      } catch (err: any) {
        console.error('Error loading dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="text-center py-12 text-slate-500">Memuat Dashboard Guru...</div>;

  return (
    <div className="space-y-6">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/40 rounded-lg text-indigo-100 uppercase tracking-wider">
            Sistem Digitalisasi Monitoring Guru Wali
          </span>
          <h1 className="text-2xl font-bold mt-1">Selamat Datang, {profile?.full_name || 'Pak Guru'}!</h1>
          <p className="text-indigo-100 text-sm mt-0.5">
            Pantau perkembangan 6 aspek monitoring murid binaan dan rilis sesi survei bimbingan Jumat.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/teacher/groups"
            className="bg-white hover:bg-indigo-50 text-indigo-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Kelola Kelompok</span>
          </Link>
          <Link
            to="/teacher/sessions"
            className="bg-indigo-500/30 hover:bg-indigo-500/50 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 border border-indigo-400/40"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Rilis Sesi Jumat</span>
          </Link>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Stat 1: Kelompok Bimbingan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kelompok Aktif</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.activeGroupCount} Kelas</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <School className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Total Murid Binaan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Murid Binaan</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalStudentCount} Siswa</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Sesi Survei Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sesi Survei Aktif</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.activeSessionCount} Sesi</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Ringkasan Kelompok Bimbingan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Ringkasan Kelompok Bimbingan Anda
          </h2>
          <Link to="/teacher/groups" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentGroups.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada kelompok bimbingan yang dibuat. Klik menu <strong>Kelola Kelompok</strong> untuk membuat kelompok baru[cite: 1, 2].
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentGroups.map((group) => (
              <div key={group.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">T.A. {group.academic_year}</span>
                  <h3 className="font-bold text-slate-800 text-base">{group.group_name}</h3>
                  <span className="text-xs font-mono font-bold text-indigo-600">Kode: {group.group_code}</span>
                </div>
                <Link
                  to="/teacher/groups"
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 rounded-lg text-xs font-semibold transition"
                >
                  Kelola →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}