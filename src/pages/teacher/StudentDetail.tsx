import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, Phone, MapPin, Calendar, FileText, Plus } from 'lucide-react';

interface StudentProfile {
  id: string;
  nisn: string;
  nis: string;
  class_name: string;
  gender: string;
  pob: string;
  dob: string;
  religion: string;
  address: string;
  parent_name: string;
  parent_job: string;
  parent_phone: string;
  special_notes: string;
  profiles?: { full_name: string; email: string };
}

interface MeetingLog {
  id: string;
  meeting_date: string;
  topic_problem: string;
  follow_up: string;
  notes: string;
  created_at: string;
}

export default function StudentDetail() {
  const { groupId, studentId } = useParams<{ groupId: string; studentId: string }>();
  const { user } = useAuth();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [logs, setLogs] = useState<MeetingLog[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Modal Jurnal
  const [showModal, setShowModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicProblem, setTopicProblem] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    if (!studentId) return;
    setLoading(true);

    try {
      // 1. Ambil data profil siswa (Bagian 1 Form Manual)
      const { data: profData, error: profErr } = await supabase
        .from('student_profiles')
        .select('*, profiles(full_name, email)')
        .eq('id', studentId)
        .single();

      if (profErr) throw profErr;
      setStudent(profData);

      // 2. Ambil jurnal bimbingan (Bagian 3 Form Manual)
      const { data: logData, error: logErr } = await supabase
        .from('meeting_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('meeting_date', { ascending: false });

      if (logErr) throw logErr;
      setLogs(logData || []);
    } catch (err: any) {
      console.error('Error fetching student detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !studentId || !groupId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('meeting_logs').insert({
        teacher_id: user.id,
        student_id: studentId,
        group_id: groupId,
        meeting_date: meetingDate,
        topic_problem: topicProblem,
        follow_up: followUp,
        notes: notes || null,
      });

      if (error) throw error;

      alert('Log pertemuan bimbingan berhasil disimpan!');
      setShowModal(false);
      setTopicProblem('');
      setFollowUp('');
      setNotes('');
      fetchStudentData();
    } catch (err: any) {
      alert('Gagal mencatat jurnal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Memuat detail profil murid binaan...</div>;

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center gap-3">
        <Link to="/teacher/groups" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Detail Murid Binaan</span>
          <h1 className="text-2xl font-bold text-slate-800">{student?.profiles?.full_name || 'Nama Murid'}</h1>
        </div>
      </div>

      {/* Card Identitas Murid (Bagian 1 Form Manual) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
          📋 Identitas Lengkap Murid
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">NISN / NIS</span>
            <span className="font-semibold text-slate-800">{student?.nisn} / {student?.nis || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Kelas & Jenis Kelamin</span>
            <span className="font-semibold text-slate-800">{student?.class_name} ({student?.gender === 'L' ? 'Laki-laki' : 'Perempuan'})</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Tempat, Tgl Lahir</span>
            <span className="font-semibold text-slate-800">{student?.pob}, {student?.dob}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Orang Tua / Wali</span>
            <span className="font-semibold text-slate-800">{student?.parent_name} ({student?.parent_job})</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">No. HP WhatsApp Ortu</span>
            <span className="font-semibold text-indigo-600">{student?.parent_phone}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Alamat Tempat Tinggal</span>
            <span className="font-semibold text-slate-800">{student?.address}</span>
          </div>
        </div>

        {student?.special_notes && (
          <div className="pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-amber-700 block">Informasi Khusus / Catatan Tambahan:</span>
            <p className="text-slate-600 mt-0.5">{student.special_notes}</p>
          </div>
        )}
      </div>

      {/* Card Jurnal Pertemuan (Bagian 3 Form Manual) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Jurnal Pertemuan / Mentoring Guru Wali
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Catatan log tatap muka personal bersama murid binaan.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan Bimbingan</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada catatan jurnal bimbingan untuk murid ini.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Topik / Masalah yang Dibahas:</h4>
                  <p className="text-sm font-semibold text-slate-800">{log.topic_problem}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tindak Lanjut (Follow-Up):</h4>
                  <p className="text-sm text-slate-700">{log.follow_up}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Tambah Jurnal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Catat Jurnal Pertemuan Baru</h2>
            <p className="text-xs text-slate-500 mb-4">Isi hasil diskusi bimbingan personal bersama murid binaan.</p>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pertemuan</label>
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topik / Masalah yang Dibahas</label>
                <textarea
                  required
                  rows={2}
                  value={topicProblem}
                  onChange={(e) => setTopicProblem(e.target.value)}
                  placeholder="Contoh: Kesulitan mengatur waktu belajar dan tugas matematika"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tindak Lanjut (Follow-Up)</label>
                <textarea
                  required
                  rows={2}
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Contoh: Diberikan jadwal belajar harian sederhana & pemantauan minggu depan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}