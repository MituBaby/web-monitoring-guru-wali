import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Archive, Copy, CheckCircle } from 'lucide-react';

interface Group {
  id: string;
  group_name: string;
  group_code: string;
  academic_year: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface Member {
  student_id: string;
  full_name: string;
}

export default function GroupCard({ 
  group, 
  onArchive 
}: { 
  group: Group; 
  onArchive: (id: string) => void; 
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [copied, setCopied] = useState(false);

  // Ambil daftar siswa di kelompok ini
  useEffect(() => {
    async function fetchMembers() {
      const { data } = await supabase
        .from('group_members')
        .select('student_id, profiles(full_name)')
        .eq('group_id', group.id);

      if (data) {
        // Mapping data agar struktur tipe datanya aman & rapi
        const formattedMembers: Member[] = data.map((item: any) => ({
          student_id: item.student_id,
          full_name: Array.isArray(item.profiles) 
            ? item.profiles[0]?.full_name || 'Siswa'
            : item.profiles?.full_name || 'Siswa',
        }));
        setMembers(formattedMembers);
      }
    }
    fetchMembers();
  }, [group.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(group.group_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${
      group.status === 'ARCHIVED' ? 'bg-slate-50 opacity-75 border-slate-200' : 'border-indigo-100 hover:border-indigo-300'
    }`}>
      <div>
        {/* Header Kartu */}
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            group.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
          }`}>
            {group.status === 'ACTIVE' ? 'Aktif' : 'Diarsipkan'}
          </span>
          <span className="text-xs text-slate-400 font-medium">T.A. {group.academic_year}</span>
        </div>

        <h3 className="font-bold text-lg text-slate-800">{group.group_name}</h3>
        <p className="text-xs text-slate-500 mb-4">Total: <strong>{members.length} Murid</strong></p>

        {/* Box Kode 6 Digit */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between mb-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Kode Unik Siswa</span>
            <span className="font-mono text-xl font-extrabold text-indigo-600 tracking-widest">{group.group_code}</span>
          </div>
          <button onClick={handleCopy} className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg">
            {copied ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* List Siswa Binaan */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Daftar Murid Binaan:</span>
          {members.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada siswa yang join.</p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {members.map((m) => (
                <Link
                  key={m.student_id}
                  to={`/teacher/groups/${group.id}/students/${m.student_id}`}
                  className="flex items-center justify-between text-xs font-medium text-slate-700 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
                >
                  <span className="truncate max-w-[150px]">{m.full_name}</span>
                  <span className="text-[10px] text-indigo-600 font-bold shrink-0">Lihat Jurnal →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Arsip */}
      {group.status === 'ACTIVE' && (
        <div className="pt-4 border-t border-slate-100 mt-4">
          <button
            onClick={() => onArchive(group.id)}
            className="text-xs font-medium text-slate-400 hover:text-amber-600 flex items-center gap-1"
          >
            <Archive className="w-4 h-4" />
            <span>Arsipkan Kelompok</span>
          </button>
        </div>
      )}
    </div>
  );
}