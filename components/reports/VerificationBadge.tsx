'use client';

interface Props {
  upvotesCount: number;
  isVerified: boolean;
  threshold?: number;
}

export function VerificationBadge({ upvotesCount, isVerified, threshold = 5 }: Props) {
  if (isVerified || upvotesCount >= threshold) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
        background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
        color: '#4ade80',
      }}>
        ✓ Community Verified
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '99px', fontSize: '12px',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.35)',
    }}>
      {upvotesCount}/{threshold} to verify
    </span>
  );
}