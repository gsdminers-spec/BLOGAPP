import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { topic, scrapedData, preferences } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const researchContext = scrapedData
            ? `RESEARCH DATA:\n${JSON.stringify(scrapedData)}\n\n`
            : '';

        const userNotes = preferences?.additionalNotes
            ? `USER NOTES: ${preferences.additionalNotes}\n\n`
            : '';

        const systemPrompt = `You are an expert technical blog writer for ASIC Repair (asicrepair.in).
    
    GOAL: Write a comprehensive, high-quality, base/draft blog article about: "${topic}".
    
    ${researchContext}
    ${userNotes}

    STRUCTURE:
    1. Title: Engaging and SEO-optimized.
    2. Introduction: Hook the reader, state the problem/topic clearly.
    3. Technical Deep Dive: Detailed explanation, use the research data.
    4. Step-by-Step Guide/Diagnostics: If applicable, practical steps.
    5. Common Issues/Solutions: Troubleshooting.
    6. Conclusion: Summary and call to action (visit asicrepair.in).
    
    TONE: Professional, Technical, Authoritative, yet accessible to technicians.
    FORMAT: Markdown. Use H1, H2, H3, bullet points, and code blocks if needed.

    IMPORTANT: 
    - Use the provided research data to ensure accuracy.
    - If research is missing specific details, use your general knowledge but mark unsure areas with [Verification Needed].
    - Do NOT output just a prompt. Output the ACTUAL ARTICLE DRAFT.
    `;

        const result = await model.generateContent(systemPrompt);
        const generatedArticle = result.response.text();

        return NextResponse.json({ success: true, article: generatedArticle });

    } catch (error: any) {
        console.error('Article Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate article' }, { status: 500 });
    }
}
