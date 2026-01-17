import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { topic, scrapedData, preferences } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // Build context from scraped data
        const researchContext = scrapedData?.map((item: any, i: number) =>
            `[Source ${i + 1}: ${item.title}]\n${item.snippet || item.url}`
        ).join('\n\n') || 'No external research provided.';

        const metaPrompt = `
You are a prompt engineering expert. Create a detailed prompt for Claude to write a comprehensive blog article.

TOPIC: ${topic}

RESEARCH DATA GATHERED:
${researchContext}

USER PREFERENCES:
- Target Audience: ASIC miner technicians in India
- Tone: Technical but accessible
- Word Count: 2000-2500 words
- SEO Focus: Include keywords naturally
${preferences?.additionalNotes || ''}

Generate a complete, copy-paste ready prompt that includes:
1. Clear instructions for Claude
2. The topic and angle to cover
3. Key points to address (based on research)
4. Specific sections to include
5. SEO keywords to weave in
6. Call-to-action for ASICREPAIR.IN

Format the output as a ready-to-use Claude prompt.
`;

        const result = await model.generateContent(metaPrompt);
        const generatedPrompt = result.response.text();

        return NextResponse.json({
            success: true,
            topic,
            prompt: generatedPrompt,
            sourcesUsed: scrapedData?.length || 0
        });

    } catch (error: any) {
        console.error('Prompt Generator Error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
