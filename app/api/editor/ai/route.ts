import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { text, instruction } = await req.json();

        if (!text || !instruction) {
            return NextResponse.json({ error: 'Text and instruction are required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
You are an expert editor for technical blog articles about ASIC miner repair.
Current Input Text: "${text}"

Instruction: ${instruction}
(Examples: "Fix grammar", "Make it more professional", "Expand this point", "Summarize")

Return ONLY the rewritten text. Do not add quotes or conversational filler.
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({
            rewritten: response
        });

    } catch (error: any) {
        console.error('Editor API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
