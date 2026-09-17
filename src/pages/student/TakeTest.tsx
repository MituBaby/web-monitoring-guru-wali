import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  is_positive: boolean;
  order_index: number;
}

export default function TakeTest() {
  const { sessionId, testType } = useParams<{ sessionId: string; testType: 'pre' | 'post' }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Ambil pertanyaan survei berdasarkan session_id
  useEffect(() => {
    async function fetchSessionAndQuestions() {
      if (!sessionId) return;
      setLoading(true);

      try {
        // Cek data session rilis
        const { data: sessionData, error: sessionErr } = await supabase
          .from('survey_sessions')
          .select('system_survey_id, custom_survey_id')
          .eq('id', sessionId)
          .single();

        if (sessionErr || !sessionData) throw new Error('Sesi survei tidak ditemukan.');

        let qData: Question[] = [];

        if (sessionData.system_survey_id) {
          const { data } = await supabase
            .from('system_survey_questions')
            .select('*')
            .eq('survey_id', sessionData.system_survey_id)
            .order('order_index');
          qData = data || [];
        } else if (sessionData.custom_survey_id) {
          const { data } = await supabase
            .from('custom_survey_questions')
            .select('*')
            .eq('survey_id', sessionData.custom_survey_id)
            .order('order_index');
          qData = data || [];
        }

        setQuestions(qData);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memuat soal survei.');
      } finally {
        setLoading(false);
      }
    }

    fetchSessionAndQuestions();
  }, [sessionId]);

  // Handle Pilihan Jawab (1-4)
  const handleOptionChange = (qId: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Submit Survei & Hitung Skor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sessionId || !testType) return;

    if (Object.keys(answers).length < questions.length) {
      alert('Harap isi semua 10 pertanyaan sebelum mengumpulkan!');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    // Hitung total skor (10 - 40) dengan pembalikan nilai pada soal negatif
    let calculatedScore = 0;
    const answerPayload = questions.map((q) => {
      const rawScore = answers[q.id];
      const finalScore = q.is_positive ? rawScore : 5 - rawScore;
      calculatedScore += finalScore;
      return { q_id: q.id, score: rawScore, calculated_score: finalScore };
    });

    try {
      const formattedType = testType === 'pre' ? 'PRE_TEST' : 'POST_TEST';

      const { error } = await supabase.from('survey_responses').insert({
        session_id: sessionId,
        student_id: user.id,
        test_type: formattedType,
        answers: answerPayload,
        total_score: calculatedScore,
        summary_text: `Skor Total: ${calculatedScore} / 40`,
        recommendation_text: calculatedScore >= 30 ? 'Perkembangan Sangat Baik' : 'Butuh Pendampingan',
      });

      if (error) throw error;

      alert(`Berhasil mengumpulkan ${testType === 'pre' ? 'Pre-Test' : 'Post-Test'}!`);
      navigate('/student/dashboard');
    } catch (err: any) {
      console.error('Error submitting test:', err);
      setErrorMsg(err.message || 'Gagal menyimpan jawaban. Anda mungkin sudah mengisi tes ini sebelumnya.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Memuat soal survei...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md uppercase tracking-wider">
            {testType === 'pre' ? 'Pre-Test Sesi Jumat' : 'Post-Test Sesi Jumat'}
          </span>
          <h1 className="text-xl font-bold text-slate-800 mt-2">Lembar Pengisian Survei Monitoring</h1>
          <p className="text-slate-500 text-xs mt-0.5">Jawablah 10 pertanyaan berikut secara jujur sesuai dengan kondisi dirimu.</p>
        </div>
        <ClipboardList className="w-10 h-10 text-indigo-600 shrink-0" />
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg shrink-0">
                Soal #{idx + 1}
              </span>
              <p className="font-semibold text-slate-800 text-sm leading-relaxed">{q.question_text}</p>
            </div>

            {/* Skala Likert 1-4 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
              {[
                { val: 1, label: 'Sangat Tidak Sesuai' },
                { val: 2, label: 'Tidak Sesuai' },
                { val: 3, label: 'Sesuai' },
                { val: 4, label: 'Sangat Sesuai' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleOptionChange(q.id, opt.val)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition ${
                    answers[q.id] === opt.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? 'Mengirim Jawaban...' : 'Kumpulkan Jawaban'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}