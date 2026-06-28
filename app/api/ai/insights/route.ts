import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { reports } = await request.json();

    if (!reports || reports.length < 3) {
      return NextResponse.json({ error: 'Need at least 3 reports' }, { status: 400 });
    }

    const summary = reports.slice(0, 20).map((r: any) => ({
      category: r.category,
      severity: r.severity,
      status: r.status,
      daysOld: Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000),
    }));

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // lightest model, least quota usage

    const prompt = `Civic issue platform analyst. Analyze this data briefly.

Data: ${JSON.stringify(summary)}

Respond ONLY with raw JSON:
{
  "topIssue": "Most common issue in one sentence",
  "riskZone": "Area or pattern most at risk",
  "avgResolutionDays": 3,
  "prediction": "One sentence prediction for next month",
  "recommendation": "One actionable recommendation",
  "recurringPattern": "Any recurring pattern spotted",
  "urgentAction": "Most urgent action needed now"
}`;

    const result   = await model.generateContent(prompt);
    const text     = result.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const insights = JSON.parse(text);
    return NextResponse.json(insights);

  } catch (error: any) {
    console.error('Insights error:', error.message);

    // Return 429 signal so client uses fallback silently
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json({ error: 'quota' }, { status: 429 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
