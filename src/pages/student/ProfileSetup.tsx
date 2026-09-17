import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Save, AlertCircle } from 'lucide-react';

export default function StudentProfileSetup() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [className, setClassName] = useState('9A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [pob, setPob] = useState('');
  const [dob, setDob] = useState('');
  const [religion, setReligion] = useState('Islam');
  const [address, setAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentJob, setParentJob] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cek apakah data diri sudah pernah diisi
  useEffect(() => {
    async function checkExistingProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && data.is_completed) {
        navigate('/student/join-group');
      }
    }
    checkExistingProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('student_profiles').upsert({
        id: user.id,
        nisn,
        nis: nis || null,
        class_name: className,
        gender,
        pob,
        dob,
        religion,
        address,
        parent_name: parentName,
        parent_job: parentJob,
        parent_phone: parentPhone,
        special_notes: specialNotes || null,
        is_completed: true,
      });

      if (error) throw error;

      await refreshProfile();
      alert('Data diri berhasil disimpan! Sekarang silakan masukkan kode bimbingan dari Guru Wali Anda.');
      navigate('/student/join-group');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || 'Gagal menyimpan data diri. Pastikan NISN belum digunakan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Lengkapi Data Diri Murid</h2>
        <p className="text-slate-500 text-sm mt-1">
          Wajib diisi sebelum dapat bergabung ke kelompok bimbingan Guru Wali.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Akademik & Identitas Dasar */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Data Identitas Murid</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">NISN (Wajib)</label>
              <input
                type="text"
                required
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Contoh: 0081234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">NIS (Opsional)</label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 212201"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Contoh: 9A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tempat Lahir</label>
              <input
                type="text"
                required
                value={pob}
                onChange={(e) => setPob(e.target.value)}
                placeholder="Contoh: Cilacap"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Agama</label>
              <input
                type="text"
                required
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Tempat Tinggal</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dusun/RT/RW/Desa"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Data Orang Tua / Wali */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">Data Orang Tua / Wali</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Orang Tua/Wali</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Nama Ayah / Ibu"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pekerjaan Orang Tua</label>
              <input
                type="text"
                required
                value={parentJob}
                onChange={(e) => setParentJob(e.target.value)}
                placeholder="Contoh: Wiraswasta / Petani"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">No. HP Orang Tua (WhatsApp)</label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Catatan Khusus */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Informasi Khusus (Opsional)
          </label>
          <textarea
            rows={2}
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="Riwayat kesehatan, penyakit bawaan, atau hal penting yang perlu diketahui Guru Wali..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Menyimpan Data...' : 'Simpan & Lanjutkan'}</span>
        </button>
      </form>
    </div>
  );
}