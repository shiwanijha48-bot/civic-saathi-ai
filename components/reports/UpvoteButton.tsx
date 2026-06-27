'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Props {
  reportId: string;
  initialCount: number;
  initialUpvoted: boolean;
  userId?: string;
}

export function UpvoteButton({ reportId, initialCount, initialUpvoted, userId }: Props) {
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    if (!userId) { toast.error('Sign in to upvote'); return; }
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    if (upvoted) {
      await supabase.from('upvotes').delete()
        .eq('report_id', reportId).eq('user_id', userId);
      setCount(c => c - 1);
      setUpvoted(false);
    } else {
      await supabase.from('upvotes').insert({ report_id: reportId, user_id: userId });
      setCount(c => c + 1);
      setUpvoted(true);
      toast.success('Upvoted!');
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        background: upvoted ? '#3b82f6' : 'rgba(255,255,255,0.08)',
        color: upvoted ? 'white' : 'rgba(255,255,255,0.6)',
        marginBottom: '24px', transition: 'all 0.15s',
      }}
    >
      <ArrowUp size={16} />
      {upvoted ? 'Upvoted' : 'Upvote'} · {count}
    </button>
  );
}