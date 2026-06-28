import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Civic Saathi AI — Report. Resolve. Rise.',
  description: 'AI-powered civic issue reporting for Indian cities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b', color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          }}
        />
      </body>
    </html>
  );
}