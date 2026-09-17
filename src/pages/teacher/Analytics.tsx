import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BarChart3, ArrowUpRight, ArrowDownRight, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';

interface StudentAnalytics {
  student_id: string;
  full_name: string;
  pre_score: number | null;
  post_score: number | null;
  delta: number | null;
  needs_flag: boolean;
}

export default function SessionAnalytics() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!sessionId) return;
      setLoading(true);

      try {
        // 1. Fetch info sesi
        const { data: sData } = await supabase
          .from('survey_sessions')
          .select('*, groups(group_name), aspect_master(name), system_surveys(title)')
          .eq('id', sessionId)
          .single();
        setSessionInfo(sData);

        if (!sData) return;

        // 2. Fetch anggota kelompok
        const { data: members } = await supabase
          .from('group_members')
          .select('student_id, profiles(full_name)')
          .eq('group_id', sData.group_id);

        // 3. Fetch jawaban Pre & Post-Test pada sesi ini
        const { data: responses } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('session_id', sessionId);

        // 4. Kalkulasi per siswa
        const result: StudentAnalytics[] = (members || []).map((m: any) => {
          const studentRes = responses?.filter((r) => r.student_id === m.student_id) || [];
          const preObj = studentRes.find((r) => r.test_type === 'PRE_TEST');
          const postObj = studentRes.find((r) => r.test_type === 'POST_TEST');

          const preScore = preObj ? preObj.total_score : null;
          const postScore = postObj ? postObj.total_score : null;

          let delta: number | null = null;
          let needsFlag = false;

          if (preScore !== null && postScore !== null) {
            delta = postScore - preScore;
            // Flag aktif jika skor post-test mengalami penurunan (delta < 0) atau post-test rendah (<25)
            if (delta < 0 || postScore < 25) {
              needsFlag = true;
            }
          }

          return {
            student_id: m.student_id,
            full_name: m.profiles?.full_name || 'Siswa',
            pre_score: preScore,
            post_score: postScore,
            delta,
            needs_flag: needsFlag,
          };
        });

        setAnalytics(result);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [sessionId]);

  if (loading) return <div className="text-center py-12 text-slate-500">Menghitung analisis delta...</div>;

  return (
    <div className="space-y-6">
      {/* Header & Navigasi Kembali */}
      <div className="flex items-center gap-3">
        <Link to="/teacher/sessions" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {sessionInfo?.aspect_master?.name} — {sessionInfo?.groups?.group_name}
          </span>
          <h1 className="text-2xl font-bold text-slate-800">
            Hasil Analisis Delta (Pre vs Post-Test)
          </h1>
        </div>
      </div>

      {/* Tabel Komparasi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-sm">Rekapitulasi Evaluasi Siswa (Skor Likert 10–40)</h3>
          <span className="text-xs text-slate-500">Total: {analytics.length} Siswa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Nama Murid Binaan</th>
                <th className="p-4 text-center">Skor Pre-Test</th>
                <th className="p-4 text-center">Skor Post-Test</th>
                <th className="p-4 text-center">Perubahan (Delta)</th>
                <th className="p-4 text-center">Status / Flag Pendampingan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {analytics.map((item) => (
                <tr key={item.student_id} className={item.needs_flag ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                  <td className="p-4 font-semibold text-slate-800">{item.full_name}</td>
                  <td className="p-4 text-center text-slate-600">
                    {item.pre_score !== null ? `${item.pre_score} / 40` : <span className="text-slate-300">Belum isi</span>}
                  </td>
                  <td className="p-4 text-center text-slate-600">
                    {item.post_score !== null ? `${item.post_score} / 40` : <span className="text-slate-300">Belum isi</span>}
                  </td>
                  <td className="p-4 text-center font-bold">
                    {item.delta !== null ? (
                      item.delta > 0 ? (
                        <span className="text-emerald-600 inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-4 h-4" />+{item.delta}
                        </span>
                      ) : item.delta < 0 ? (
                        <span className="text-rose-600 inline-flex items-center gap-0.5">
                          <ArrowDownRight className="w-4 h-4" />
                          {item.delta}
                        </span>
                      ) : (
                        <span className="text-slate-500">0 (Tetap)</span>
                      )
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.needs_flag ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Butuh Pendampingan
                      </span>
                    ) : item.post_score !== null ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Perkembangan Baik
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Menunggu Post-Test</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}