import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model fallback list — tries each in order
const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;

    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: 'Description required' }, { status: 400 });
    }

    const prompt = `You are a civic issue classifier for an Indian city. Analyze this civic problem.

User description: "${description}"

Respond ONLY with raw JSON (no markdown, no code blocks):
{
  "title": "Short title under 60 characters",
  "category": "One of: Pothole, Garbage / Waste, Water Leakage, Streetlight Issue, Road Damage, Public Safety, Illegal Dumping, Broken Infrastructure, Flooding, Tree / Park Issue, Other",
  "severity": "One of: low, medium, high, critical",
  "summary": "2-3 sentences about the issue and its impact",
  "department": "One of: Roads & Infrastructure, Sanitation & Waste, Water & Utilities, Electrical & Lighting, Public Safety, Parks & Recreation",
  "confidence": 0.9
}

Severity: low=minor, medium=this week, high=24-48hrs, critical=immediate danger`;

    let lastError: any;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        let result;
        if (imageFile && imageFile.size > 0) {
          const bytes = await imageFile.arrayBuffer();
          const base64 = Buffer.from(bytes).toString('base64');
          result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType: imageFile.type } },
          ]);
        } else {
          result = await model.generateContent(prompt);
        }

        const text = result.response.text().trim();
        const cleaned = text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        const analysis = JSON.parse(cleaned);

        // Validate required fields
        if (!analysis.title || !analysis.category || !analysis.severity) {
          throw new Error('Invalid AI response structure');
        }

        return NextResponse.json(analysis);
      } catch (err: any) {
        lastError = err;
        console.error(`Model ${modelName} failed:`, err.message);
        // If it's a 503/overload, try next model
        if (err.message?.includes('503') || err.message?.includes('overload') || err.message?.includes('unavailable')) {
          continue;
        }
        // For other errors (auth, invalid key etc) don't retry
        break;
      }
    }

    // All models failed — return a smart fallback based on keywords
    console.error('All models failed, using keyword fallback');
    const fallback = keywordFallback(description);
    return NextResponse.json(fallback);

  } catch (error: any) {
    console.error('AI route error:', error);
    return NextResponse.json(
      { error: error.message ?? 'AI analysis failed' },
      { status: 500 }
    );
  }
}

// Keyword-based fallback when Gemini is down
function keywordFallback(description: string) {
  const d = description.toLowerCase();

  let category = 'Other';
  let department = 'Roads & Infrastructure';
  let severity: string = 'medium';

  if (d.includes('pothole') || d.includes('road') || d.includes('crack')) {
    category = 'Pothole'; department = 'Roads & Infrastructure';
  } else if (d.includes('garbage') || d.includes('waste') || d.includes('trash') || d.includes('dump')) {
    category = 'Garbage / Waste'; department = 'Sanitation & Waste';
  } else if (d.includes('water') || d.includes('leak') || d.includes('pipe') || d.includes('drain')) {
    category = 'Water Leakage'; department = 'Water & Utilities';
  } else if (d.includes('light') || d.includes('street light') || d.includes('lamp')) {
    category = 'Streetlight Issue'; department = 'Electrical & Lighting';
  } else if (d.includes('safety') || d.includes('danger') || d.includes('crime')) {
    category = 'Public Safety'; department = 'Public Safety';
  } else if (d.includes('flood') || d.includes('waterlog')) {
    category = 'Flooding'; department = 'Water & Utilities';
  } else if (d.includes('tree') || d.includes('park') || d.includes('garden')) {
    category = 'Tree / Park Issue'; department = 'Parks & Recreation';
  }

  if (d.includes('urgent') || d.includes('danger') || d.includes('accident') || d.includes('emergency')) {
    severity = 'critical';
  } else if (d.includes('bad') || d.includes('serious') || d.includes('major')) {
    severity = 'high';
  } else if (d.includes('minor') || d.includes('small') || d.includes('little')) {
    severity = 'low';
  }

  const words = description.trim().split(' ').slice(0, 8).join(' ');

  return {
    title: words.length > 50 ? words.slice(0, 50) + '…' : words,
    category,
    severity,
    summary: `A ${category.toLowerCase()} issue has been reported: "${description.slice(0, 100)}". This has been automatically classified and routed to the ${department} department for review.`,
    department,
    confidence: 0.6,
  };
}