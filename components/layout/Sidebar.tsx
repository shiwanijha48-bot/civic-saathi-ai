'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Map, Users, BarChart3, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BADGE_LEVELS } from '@/lib/constants';
import toast from 'react-hot-toast';

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
    router.refresh();
  };

  const badgeKey = (profile?.badge_level ?? 'newcomer') as keyof typeof BADGE_LEVELS;
  const badge = BADGE_LEVELS[badgeKey] ?? BADGE_LEVELS.newcomer;

  // Build nav items dynamically — only show Admin if user is admin
  const navItems = [
    { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/report',     icon: PlusCircle,       label: 'Report issue' },
    { href: '/map',        icon: Map,              label: 'Issue map' },
    { href: '/community',  icon: Users,            label: 'Community' },
    // Admin only shown if profile.is_admin is true
    ...((profile as any)?.is_admin ? [{ href: '/admin', icon: BarChart3, label: 'Admin' }] : []),
  ];

  return (
    <aside style={{
      width: '256px', display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, flexShrink: 0,
      backgroundColor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={18} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Civic Saathi</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s',
                backgroundColor: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {profile ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '14px',
              }}>
                {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.name}
                  {(profile as any).is_admin && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '99px' }}>
                      ADMIN
                    </span>
                  )}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                  {badge.icon} {badge.label} · {profile.points} pts
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'inherit',
              }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </>
        ) : (
          <div style={{ padding: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'pulse 2s infinite' }} />
          </div>
        )}
      </div>
    </aside>
  );
}