import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { description, latitude, longitude, category } = await req.json();

  const supabase = await createClient();

  // Get reports within last 30 days in same category
  const { data: nearbyReports } = await supabase
    .from('reports')
    .select('id, title, description, latitude, longitude, status, created_at, category')
    .eq('category', category)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .neq('status', 'closed');

  if (!nearbyReports || nearbyReports.length === 0) {
    return NextResponse.json({ duplicate: false });
  }

  // Filter by distance (within ~500m)
  const nearby = nearbyReports.filter(r => {
    if (!r.latitude || !r.longitude || !latitude || !longitude) return false;
    const dLat = (r.latitude - latitude) * Math.PI / 180;
    const dLon = (r.longitude - longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(latitude * Math.PI / 180) * Math.cos(r.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return distance < 500;
  });

  if (nearby.length === 0) {
    return NextResponse.json({ duplicate: false });
  }

  // Check text similarity
  const descWords = description.toLowerCase().split(' ').filter((w: string) => w.length > 3);
  
  const matches = nearby.map(r => {
    const reportWords = (r.title + ' ' + r.description).toLowerCase().split(' ');
    const common = descWords.filter((w: string) => reportWords.some((rw: string) => rw.includes(w)));
    const similarity = descWords.length > 0 ? common.length / descWords.length : 0;
    return { ...r, similarity };
  }).filter(r => r.similarity > 0.3).sort((a, b) => b.similarity - a.similarity);

  if (matches.length === 0) {
    return NextResponse.json({ duplicate: false });
  }

  return NextResponse.json({
    duplicate: true,
    matches: matches.slice(0, 2).map(r => ({
      id: r.id,
      title: r.title,
      status: r.status,
      created_at: r.created_at,
      similarity: Math.round(r.similarity * 100),
    })),
  });
}