import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const { reportTitle, reportId, newStatus, userEmail, userName } = await req.json();

  const statusLabels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved ✅',
    closed: 'Closed',
  };

  const statusColors: Record<string, string> = {
    open: '#3b82f6',
    in_progress: '#a855f7',
    resolved: '#22c55e',
    closed: '#64748b',
  };

  try {
    await transporter.sendMail({
      from: `"Civic Saathi" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Your report status updated — ${statusLabels[newStatus] ?? newStatus}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f172a;color:#f8fafc;border-radius:16px">
          <div style="margin-bottom:24px">
            <span style="font-weight:700;font-size:20px;color:#f8fafc">📍 Civic Saathi</span>
          </div>

          <h2 style="color:#f8fafc;font-size:20px;margin:0 0 8px">Hi ${userName ?? 'there'} 👋</h2>
          <p style="color:rgba(255,255,255,0.6);margin:0 0 24px">Your reported issue status has been updated by the authorities.</p>

          <div style="background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em">Report</p>
            <p style="color:#f8fafc;font-weight:600;font-size:15px;margin:0 0 16px">${reportTitle}</p>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em">New Status</p>
            <span style="display:inline-block;padding:4px 14px;border-radius:99px;background:${statusColors[newStatus] ?? '#3b82f6'};color:white;font-weight:600;font-size:14px">
              ${statusLabels[newStatus] ?? newStatus}
            </span>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reports/${reportId}"
             style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none">
            View your report →
          </a>

          <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:24px">
            You received this because you filed a report on Civic Saathi.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}