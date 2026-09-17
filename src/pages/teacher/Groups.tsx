import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import GroupCard from '../../components/GroupCard';
import { Users, Plus, School } from 'lucide-react';

export default function TeacherGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [groupName, setGroupName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    setGroups(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // Buat Kelompok Baru
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

    try {
      const { error } = await supabase.from('groups').insert({
        teacher_id: user.id,
        group_name: groupName,
        group_code: code,
        academic_year: academicYear,
        status: 'ACTIVE',
      });

      if (error) throw error;
      setGroupName('');
      setShowModal(false);
      fetchGroups();
    } catch (err: any) {
      alert('Gagal membuat kelompok: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Arsipkan Kelompok
  const handleArchiveGroup = async (groupId: string) => {
    if (!confirm('Arsipkan kelompok ini?')) return;
    await supabase.from('groups').update({ status: 'ARCHIVED' }).eq('id', groupId);
    fetchGroups();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Kelola Kelompok Bimbingan
          </h1>
          <p className="text-slate-500 text-sm mt-1">Buat kelompok baru dan bagikan kode 6 digit ke siswa.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-5 h-5" /> Buat Kelompok Baru
        </button>
      </div>

      {/* Grid Kelompok */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat data kelompok...</div>
      ) : groups.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Belum Ada Kelompok Bimbingan</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onArchive={handleArchiveGroup} />
          ))}
        </div>
      )}

      {/* Modal Buat Kelompok */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Buat Kelompok Baru</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelompok</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Bimbingan Kelas 9 - 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl">
                  {isSubmitting ? 'Memproses...' : 'Buat Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}