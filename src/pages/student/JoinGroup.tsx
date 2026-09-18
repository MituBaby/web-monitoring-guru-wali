import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export default function JoinGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);
    const cleanCode = groupCode.trim().toUpperCase();

    try {
      // 1. Cari grup berdasarkan kode 6 digit
      const { data: group, error: groupErr } = await supabase
        .from('groups')
        .select('id, group_name, status')
        .eq('group_code', cleanCode)
        .single();

      if (groupErr || !group) {
        throw new Error('Kode 6 digit tidak ditemukan. Periksa kembali ketikan Anda.');
      }

      if (group.status !== 'ACTIVE') {
        throw new Error('Kelompok ini sudah diarsipkan dan tidak menerima siswa baru.');
      }

      // 2. Daftarkan siswa ke tabel group_members
      const { error: joinErr } = await supabase.from('group_members').insert({
        group_id: group.id,
        student_id: user.id,
      });

      if (joinErr) {
        if (joinErr.code === '23505') {
          throw new Error('Anda sudah terdaftar di kelompok bimbingan ini!');
        }
        throw joinErr;
      }

      alert(`Berhasil bergabung ke kelompok "${group.group_name}"!`);
      navigate('/student/dashboard');
    } catch (err: any) {
      console.error('Error joining group:', err);
      setErrorMsg(err.message || 'Gagal bergabung ke kelompok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-lg border border-slate-100 text-center">
      <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
        <KeyRound className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800">Bergabung Kelompok Bimbingan</h2>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Masukkan 6 digit kode unik yang diberikan oleh Guru Wali Anda.
      </p>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleJoin} className="space-y-5">
        <div>
          <input
            type="text"
            required
            maxLength={6}
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
            placeholder="CONTOH: X7K9P2"
            className="w-full text-center text-2xl font-mono font-extrabold tracking-widest py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white uppercase outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || groupCode.length < 6}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{loading ? 'Memproses...' : 'Bergabung Sekarang'}</span>
        </button>
      </form>
    </div>
  );
}