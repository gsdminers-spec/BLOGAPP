import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { keyword, content } = await req.json();

        if (!keyword || !content) {
            return NextResponse.json({ error: 'Keyword and content are required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
You are an advanced SEO Audit Bot. 
Target Keyword: "${keyword}"
Current Content: """${content.substring(0, 3000)}"""... (truncated)

Task: 
1. Identify 3 critical "LSI Keywords" or related technical terms that are MISSING from this content but likely found in top-ranking competitor articles.
2. Identify 1 major "Content Gap" (e.g., missing table, missing FAQ, missing step-by-step).

Return JSON format:
{
  "missingKeywords": ["term1", "term2", "term3"],
  "contentGap": "Description of the gap"
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Cleanup JSON if Gemini adds markdown blocks
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('SEO API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
