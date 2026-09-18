import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, CheckCircle2, Clock, AlertCircle, BookOpen } from 'lucide-react';

interface ActiveSession {
  id: string;
  aspect_id: number;
  created_at: string;
  aspect_master?: { name: string };
  system_surveys?: { title: string };
  custom_surveys?: { title: string };
  pre_completed?: boolean;
  post_completed?: boolean;
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentDashboard() {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Ambil ID grup siswa dari group_members
        const { data: memberData } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('student_id', user.id)
          .single();

        if (!memberData) {
          setLoading(false);
          return;
        }

        // 2. Ambil sesi rilis yang aktif untuk grup siswa tersebut
        const { data: sessionData, error } = await supabase
          .from('survey_sessions')
          .select(`
            id,
            aspect_id,
            created_at,
            aspect_master (name),
            system_surveys (title),
            custom_surveys (title)
          `)
          .eq('group_id', memberData.group_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 3. Cek respon yang sudah pernah dikerjakan siswa ini (Pre / Post)
        const { data: responses } = await supabase
          .from('survey_responses')
          .select('session_id, test_type')
          .eq('student_id', user.id);

        const sessionWithStatus = (sessionData || []).map((sess: any) => {
          const studentRes = responses?.filter((r) => r.session_id === sess.id) || [];
          const hasPre = studentRes.some((r) => r.test_type === 'PRE_TEST');
          const hasPost = studentRes.some((r) => r.test_type === 'POST_TEST');

          return {
            ...sess,
            pre_completed: hasPre,
            post_completed: hasPost,
          };
        });

        setSessions(sessionWithStatus);
      } catch (err: any) {
        console.error('Error loading dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentDashboard();
  }, [user]);

  if (loading) return <div className="text-center py-12 text-slate-500">Memuat Dashboard Siswa...</div>;

  return (
    <div className="space-y-6">
      {/* Banner Selamat Datang */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/40 rounded-lg text-indigo-100 uppercase tracking-wider">
            Area Siswa Bimbingan
          </span>
          <h1 className="text-2xl font-bold mt-1">Selamat Datang, {profile?.full_name || 'Siswa'}!</h1>
          <p className="text-indigo-100 text-sm mt-0.5">
            Pantau sesi survei bimbingan Jumat dan tingkatkan pemahaman 6 aspek monitoring dirimu.
          </p>
        </div>
        <Link
          to="/student/materi"
          className="bg-white hover:bg-indigo-50 text-indigo-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-2 shrink-0 shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Baca Materi 6 Aspek</span>
        </Link>
      </div>

      {/* Daftar Sesi Jumat Aktif */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>Sesi Survei Jumat Hari Ini</span>
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-700">Belum Ada Sesi Survei Aktif</h3>
            <p className="text-slate-500 text-xs mt-1">
              Guru Wali Anda belum merilis modul survei untuk sesi hari ini. Silakan baca-baca materi dahulu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => (
              <div key={sess.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wider">
                    {sess.aspect_master?.name}
                  </span>
                  <h3 className="font-bold text-slate-800 text-base mt-2">
                    {sess.system_surveys?.title || sess.custom_surveys?.title}
                  </h3>
                </div>

                {/* Status Pengerjaan Pre vs Post */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  {/* Option 1: Pre-Test */}
                  {sess.pre_completed ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="block text-[11px] font-bold text-emerald-700 uppercase">Pre-Test</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 mt-1">
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </span>
                    </div>
                  ) : (
                    <Link
                      to={`/student/test/${sess.id}/pre`}
                      className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center transition shadow-sm"
                    >
                      <span className="block text-[11px] font-bold uppercase text-indigo-200">Pre-Test</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold mt-1">
                        <PlayCircle className="w-4 h-4" /> Kerjakan
                      </span>
                    </Link>
                  )}

                  {/* Option 2: Post-Test */}
                  {sess.post_completed ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="block text-[11px] font-bold text-emerald-700 uppercase">Post-Test</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 mt-1">
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </span>
                    </div>
                  ) : (
                    <Link
                      to={`/student/test/${sess.id}/post`}
                      className={`p-3 rounded-xl text-center transition ${
                        sess.pre_completed
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <span className="block text-[11px] font-bold uppercase text-slate-400">Post-Test</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold mt-1">
                        {sess.pre_completed ? <PlayCircle className="w-4 h-4" /> : 'Kunci'} Kerjakan
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}