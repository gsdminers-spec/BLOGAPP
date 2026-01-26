import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { topic, scrapedData } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Switching to stable alias: gemini-flash-latest
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const context = scrapedData
            ? `Use the following research data to inform your prompt:\n${JSON.stringify(scrapedData)}\n\n`
            : '';

        const systemPrompt = `You are an expert prompt engineer for an AI blog writer. 
    Create a detailed, structured prompt that will guide another AI to write a comprehensive blog article about: "${topic}".
    
    ${context}

    The generated prompt should:
    1. Define the role (Expert ASIC Repair Technician).
    2. Outline the article structure (Intro, Technical Deep Dive, Diagnostics, Repair Steps, Conclusion).
    3. Specify tone (Professional, Technical, Authoritative).
    4. Request specific SEO keywords if relevant.
    
    Return ONLY the prompt text, no introductory commentary.`;

        const result = await model.generateContent(systemPrompt);
        const generatedPrompt = result.response.text();

        return NextResponse.json({ success: true, prompt: generatedPrompt });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Prompt Generation CRASH:', errorMessage);
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
        return NextResponse.json({ error: errorMessage || 'Failed to generate prompt' }, { status: 500 });
    }
}
