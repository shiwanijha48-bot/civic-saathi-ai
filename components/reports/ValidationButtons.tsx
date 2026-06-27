'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  reportId: string;
  userId?: string;
  initialConfirms: number;
  initialDisputes: number;
  initialUserValidation: 'confirm' | 'dispute' | null;
}

export function ValidationButtons({
  reportId, userId,
  initialConfirms, initialDisputes, initialUserValidation,
}: Props) {
  const [userValidation, setUserValidation] = useState(initialUserValidation);
  const [confirms, setConfirms] = useState(initialConfirms);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = async (type: 'confirm' | 'dispute') => {
    if (!userId) { toast.error('Sign in to validate'); return; }
    if (loading) return;
    setLoading(true);
    const supabase = createClient();

    if (userValidation === type) {
      // Remove validation
      await supabase.from('report_validations')
        .delete()
        .eq('report_id', reportId)
        .eq('user_id', userId);

      if (type === 'confirm') setConfirms(c => c - 1);
      else setDisputes(d => d - 1);
      setUserValidation(null);
      toast.success('Validation removed');
    } else {
      if (userValidation) {
        // Switch validation
        await supabase.from('report_validations')
          .update({ type })
          .eq('report_id', reportId)
          .eq('user_id', userId);

        if (type === 'confirm') { setConfirms(c => c + 1); setDisputes(d => d - 1); }
        else { setDisputes(d => d + 1); setConfirms(c => c - 1); }
      } else {
        // New validation
        await supabase.from('report_validations')
          .insert({ report_id: reportId, user_id: userId, type });

        if (type === 'confirm') setConfirms(c => c + 1);
        else setDisputes(d => d + 1);
      }
      setUserValidation(type);
      toast.success(type === 'confirm' ? '✅ Confirmed — thanks for validating!' : '⚠️ Disputed — we\'ll look into it');
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '16px 20px', marginBottom: '16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '12px',
    }}>
      <div>
        <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, margin: '0 0 2px' }}>
          Have you seen this issue?
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
          Help the community validate this report
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => validate('confirm')}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: userValidation === 'confirm' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)',
            color: userValidation === 'confirm' ? '#4ade80' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.15s',
          }}
        >
          <ThumbsUp size={14} />
          Yes, I've seen it · {confirms}
        </button>

        <button
          onClick={() => validate('dispute')}
          disabled={loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: userValidation === 'dispute' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)',
            color: userValidation === 'dispute' ? '#f87171' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.15s',
          }}
        >
          <ThumbsDown size={14} />
          Not accurate · {disputes}
        </button>
      </div>
    </div>
  );
}