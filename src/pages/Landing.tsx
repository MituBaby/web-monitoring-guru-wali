import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
        Sistem Web Monitoring Guru Wali
      </h1>
      <p className="text-slate-600 max-w-xl mb-8">
        Digitalisasi pendampingan dan pemantauan perkembangan murid secara interaktif, terstruktur, dan transparan.
      </p>
      <div className="flex gap-4">
        <Link
          to="/auth/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow transition"
        >
          Masuk / Login
        </Link>
        <Link
          to="/auth/register"
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-lg shadow-sm transition"
        >
          Daftar Akun Baru
        </Link>
      </div>
    </div>
  );
}