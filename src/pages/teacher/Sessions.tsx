import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, BarChart3, Plus, Clock } from 'lucide-react';

interface Group {
  id: string;
  group_name: string;
}

interface SurveySession {
  id: string;
  group_id: string;
  aspect_id: number;
  is_active: boolean;
  created_at: string;
  groups?: { group_name: string };
  aspect_master?: { name: string };
  system_surveys?: { title: string };
  custom_surveys?: { title: string };
}

interface SystemSurvey {
  id: string;
  aspect_id: number;
  title: string;
  code: string;
}

export default function TeacherSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [systemSurveys, setSystemSurveys] = useState<SystemSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Release
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedAspect, setSelectedAspect] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Ambil daftar kelompok guru
      const { data: grpData } = await supabase
        .from('groups')
        .select('id, group_name')
        .eq('teacher_id', user.id)
        .eq('status', 'ACTIVE');
      setGroups(grpData || []);

      if (grpData && grpData.length > 0) {
        setSelectedGroup(grpData[0].id);
      }

      // 2. Ambil modul survei sistem
      const { data: sysData } = await supabase
        .from('system_surveys')
        .select('*')
        .order('aspect_id');
      setSystemSurveys(sysData || []);

      if (sysData && sysData.length > 0) {
        setSelectedSurvey(sysData[0].id);
      }

      // 3. Ambil sesi rilis yang sudah pernah dibuat
      const { data: sessData, error } = await supabase
        .from('survey_sessions')
        .select(`
          *,
          groups (group_name),
          aspect_master (name),
          system_surveys (title),
          custom_surveys (title)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(sessData || []);
    } catch (err: any) {
      console.error('Error fetching sessions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter survei berdasarkan aspek yang dipilih
  const filteredSurveys = systemSurveys.filter((s) => s.aspect_id === Number(selectedAspect));

  // Handler Rilis Survei Baru
  const handleReleaseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroup || !selectedSurvey) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('survey_sessions').insert({
        group_id: selectedGroup,
        teacher_id: user.id,
        aspect_id: Number(selectedAspect),
        system_survey_id: selectedSurvey,
        is_active: true,
      });

      if (error) throw error;

      alert('Sesi Survei berhasil dirilis ke siswa!');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert('Gagal merilis sesi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Selesai/Tutup Sesi
  const handleToggleSessionStatus = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('survey_sessions')
        .update({ is_active: !currentStatus })
        .eq('id', sessionId);

      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert('Gagal mengubah status sesi: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PlayCircle className="w-7 h-7 text-indigo-600" />
            Control Panel Sesi Survei Jumat
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Rilis modul survei Pre-Test & Post-Test untuk jam 1JP bimbingan Jumat.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          <span>Rilis Sesi Baru</span>
        </button>
      </div>

      {/* Tabel Sesi */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat data sesi...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Belum Ada Sesi Survei Aktif</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Klik "Rilis Sesi Baru" untuk memilih modul 10 soal dan membukanya bagi siswa bimbingan Anda.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4">Kelompok</th>
                  <th className="p-4">Aspek & Judul Modul</th>
                  <th className="p-4">Status Sesi</th>
                  <th className="p-4">Tanggal Rilis</th>
                  <th className="p-4 text-center">Aksi / Analisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-semibold text-slate-800">
                      {session.groups?.group_name || '-'}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded mr-2">
                        {session.aspect_master?.name}
                      </span>
                      <span className="font-medium text-slate-700">
                        {session.system_surveys?.title || session.custom_surveys?.title}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleSessionStatus(session.id, session.is_active)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                          session.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {session.is_active ? '🟢 Aktif (Siswa Bisa Isi)' : '⚪ Ditutup'}
                      </button>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(session.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        to={`/teacher/sessions/${session.id}/analytics`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 transition"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Lihat Hasil & Delta</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Release */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Rilis Sesi Survei Baru</h2>
            <p className="text-slate-500 text-xs mb-6">
              Pilih kelompok bimbingan dan modul survei yang akan digunakan pada sesi Jumat.
            </p>

            <form onSubmit={handleReleaseSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Kelompok Siswa
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Aspek Monitoring
                </label>
                <select
                  value={selectedAspect}
                  onChange={(e) => {
                    setSelectedAspect(Number(e.target.value));
                    const first = systemSurveys.find((s) => s.aspect_id === Number(e.target.value));
                    if (first) setSelectedSurvey(first.id);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>1. Akademik</option>
                  <option value={2}>2. Potensi & Minat</option>
                  <option value={3}>3. Sosial-Emosional</option>
                  <option value={4}>4. Karakter / Sikap</option>
                  <option value={5}>5. Kemandirian & Motivasi</option>
                  <option value={6}>6. Dukungan Lingkungan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Modul Survei (10 Soal)
                </label>
                <select
                  value={selectedSurvey}
                  onChange={(e) => setSelectedSurvey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {filteredSurveys.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Rilis Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}