import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, Target, HeartHandshake, ShieldCheck, Zap, Home, ChevronRight } from 'lucide-react';

interface Aspect {
  id: number;
  name: string;
  description: string;
}

export default function StudentMateri() {
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [selectedAspect, setSelectedAspect] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Ambil data 6 aspek dari database Supabase
  useEffect(() => {
    async function fetchAspects() {
      const { data, error } = await supabase.from('aspect_master').select('*').order('id');
      if (!error && data) {
        setAspects(data);
      }
      setLoading(false);
    }
    fetchAspects();
  }, []);

  // Ikon penunjang per aspek
  const getAspectIcon = (id: number) => {
    switch (id) {
      case 1: return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 2: return <Target className="w-5 h-5 text-purple-600" />;
      case 3: return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 4: return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 5: return <Zap className="w-5 h-5 text-amber-600" />;
      case 6: return <Home className="w-5 h-5 text-indigo-600" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  // Konten edukasi mendalam per aspek
  const getMateriContent = (id: number) => {
    switch (id) {
      case 1:
        return {
          definisi: "Pemahaman materi pelajaran, pengerjaan tugas, dan pencapaian akademik di sekolah.",
          contoh: ["Aktif mendengarkan penjelasan guru di kelas", "Mengumpulkan tugas sebelum tenggat waktu", "Mencatat hal penting saat jam pelajaran"],
          tips: ["Buat jadwal belajar rutin 20–30 menit tiap malam.", "Jangan ragu bertanya ke guru atau teman jika belum paham.", "Catat deadline tugas di HP atau buku agenda."]
        };
      case 2:
        return {
          definisi: "Bakat, minat, hobi, dan hal-hal positif yang kamu sukai dan kuasai.",
          contoh: ["Aktif di keorganisasian atau ekstrakurikuler", "Tekun berlatih seni, olahraga, atau teknologi", "Suka mencoba hal baru"],
          tips: ["Ikuti kegiatan ekstrakurikuler yang sesuai minatmu.", "Luangkan waktu 1 jam seminggu untuk melatih hobimu.", "Ikuti lomba atau unjuk bakat untuk melatih mental."]
        };
      case 3:
        return {
          definisi: "Kemampuan mengendalikan emosi, mengekspresikan perasaan, dan berinteraksi sehat dengan teman.",
          contoh: ["Menjaga sopan santun saat bergaul", "Mampu menenangkan diri saat merasa marah/stres", "Menghargai perbedaan pendapat"],
          tips: ["Tarik napas dalam-dalam saat mulai merasa emosi/stres.", "Ceritakan kendala atau masalahmu ke orang terpercaya/Guru BK.", "Belajar jadi pendengar yang baik untuk temanmu."]
        };
      case 4:
        return {
          definisi: "Kedisiplinan, kejujuran, tanggung jawab, dan etika bersikap sehari-hari.",
          contoh: ["Hadir di sekolah tepat waktu", "Mengerjakan ujian secara jujur tanpa menyontek", "Mengakui dan memperbaiki kesalahan"],
          tips: ["Patuhi tata tertib sekolah dengan kesadaran diri.", "Biasakan menggunakan kata 'maaf', 'tolong', dan 'terima kasih'.", "Tepati janji dan tugas kelompok yang telah disepakati."]
        };
      case 5:
        return {
          definisi: "Inisiatif belajar mandiri, semangat pantang menyerah, dan dorongan dari dalam diri.",
          contoh: ["Menyiapkan peralatan sekolah sendiri dari malam", "Memiliki target nilai pribadi yang jelas", "Bangkit kembali setelah gagal"],
          tips: ["Tentukan target pribadi (misal: nilai Matematika naik).", "Kurangi menunda-nunda pekerjaan rumah.", "Apresiasi diri sendiri jika berhasil mencapai target kecil."]
        };
      case 6:
        return {
          definisi: "Komunikasi, perhatian keluarga, dan suasana mendukung belajar di rumah.",
          contoh: ["Terbuka menceritakan pengalaman sekolah ke orang tua", "Memiliki waktu belajar yang tenang di rumah", "Mendapat fasilitas belajar memadai"],
          tips: ["Luangkan waktu bercerita ke orang tua mengenai kegiatanmu.", "Jaga kerapian dan ketenangan meja/area belajarmu.", "Diskusikan kendala fasilitas belajar secara baik-baik dengan orang tua."]
        };
      default:
        return { definisi: "", contoh: [], tips: [] };
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Memuat materi edukasi...</div>;

  const currentContent = getMateriContent(selectedAspect);
  const activeAspectData = aspects.find((a) => a.id === selectedAspect);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-7 h-7" />
          Materi Monitoring & Pengembangan Diri
        </h1>
        <p className="text-indigo-100 text-sm mt-1">
          Pelajari konsep 6 Aspek Monitoring untuk membantu perkembangan dirimu selama di sekolah.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigasi 6 Aspek */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Daftar 6 Aspek Monitoring
          </h2>
          {aspects.map((aspect) => (
            <button
              key={aspect.id}
              onClick={() => setSelectedAspect(aspect.id)}
              className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                selectedAspect === aspect.id
                  ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  {getAspectIcon(aspect.id)}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${selectedAspect === aspect.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {aspect.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{aspect.description}</p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${selectedAspect === aspect.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>

        {/* Panel Detail Konten Edukasi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                {getAspectIcon(selectedAspect)}
              </div>
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Aspek #{selectedAspect}</span>
                <h2 className="text-xl font-bold text-slate-800">{activeAspectData?.name}</h2>
              </div>
            </div>

            {/* Definisi */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">💡 Definisi Sederhana</h4>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm leading-relaxed">
                {currentContent.definisi}
              </p>
            </div>

            {/* Contoh Perilaku */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🔍 Contoh Perilaku Nyata</h4>
              <ul className="space-y-2">
                {currentContent.contoh.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips Cara Meningkatkan */}
            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">🚀 Tips Cara Meningkatkan</h4>
              <ul className="space-y-2.5">
                {currentContent.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-indigo-950 font-medium">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}