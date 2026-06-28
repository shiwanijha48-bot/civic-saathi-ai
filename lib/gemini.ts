import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeIssueImage(
  imageBase64: string,
  mimeType: string,
  userDescription: string
): Promise<AIAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a civic issue classifier for an Indian city. Analyze this image and the user description to classify the civic problem.

User description: "${userDescription}"

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short descriptive title (max 60 chars)",
  "category": "One of: Pothole, Garbage / Waste, Water Leakage, Streetlight Issue, Road Damage, Public Safety, Illegal Dumping, Broken Infrastructure, Flooding, Tree / Park Issue, Other",
  "severity": "One of: low, medium, high, critical",
  "summary": "2-3 sentence AI-generated summary of the issue and its impact",
  "department": "One of: Roads & Infrastructure, Sanitation & Waste, Water & Utilities, Electrical & Lighting, Public Safety, Parks & Recreation",
  "confidence": 0.95
}

Severity guidelines:
- low: Minor inconvenience, not urgent
- medium: Needs attention within a week
- high: Needs attention within 24-48 hours, public impact
- critical: Immediate danger to public safety`;

  const imagePart = {
    inlineData: { data: imageBase64, mimeType }
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();
  
  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as AIAnalysis;
}

export async function analyzeIssueText(description: string): Promise<AIAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a civic issue classifier for an Indian city. Based on this description, classify the civic problem.

Description: "${description}"

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short descriptive title (max 60 chars)",
  "category": "One of: Pothole, Garbage / Waste, Water Leakage, Streetlight Issue, Road Damage, Public Safety, Illegal Dumping, Broken Infrastructure, Flooding, Tree / Park Issue, Other",
  "severity": "One of: low, medium, high, critical",
  "summary": "2-3 sentence AI-generated summary of the issue and its impact",
  "department": "One of: Roads & Infrastructure, Sanitation & Waste, Water & Utilities, Electrical & Lighting, Public Safety, Parks & Recreation",
  "confidence": 0.85
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as AIAnalysis;
}
