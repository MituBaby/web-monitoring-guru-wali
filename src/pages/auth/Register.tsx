import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserPlus, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Mendaftarkan user ke Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        alert('Pendaftaran berhasil! Silakan login dengan akun Anda.');
        navigate('/auth/login');
      }
    } catch (err: any) {
      console.error('Error Registering:', err);
      setErrorMsg(err.message || 'Gagal mendaftarkan akun. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h2>
        <p className="text-slate-500 text-sm mt-1">Sistem Web Monitoring Guru Wali</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Pilihan Peran / Role */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Daftar Sebagai:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition ${
                role === 'STUDENT'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 transition ${
                role === 'TEACHER'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Guru Wali</span>
            </button>
          </div>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nama Lengkap
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Hikmal Supriadi"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm outline-none transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Alamat Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm outline-none transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Kata Sandi (Password)
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm outline-none transition"
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Sudah memiliki akun?{' '}
        <Link to="/auth/login" className="text-indigo-600 font-semibold hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}