import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase (Use SERVER keys here)
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Generate Embedding for the User's Query
        const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
        const embeddingResult = await embeddingModel.embedContent(message);
        const queryVector = embeddingResult.embedding.values;

        // 2. Search Supabase for Matching Context
        const { data: documents, error: searchError } = await supabase.rpc('match_documents', {
            query_embedding: queryVector,
            match_threshold: 0.5, // Increase if getting irrelevant results
            match_count: 5 // Top 5 relevant chunks
        });

        if (searchError) {
            console.error('Vector Search Error:', searchError);
            return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 });
        }

        // 3. Construct Context for the AI
        const contextText = documents
            ?.map((doc: any) => `[Source: ${doc.title}]\n${doc.content}`)
            .join('\n\n---\n\n');

        const systemPrompt = `
You are the "ASIC Brain", an expert AI assistant for ASIC miner repair technicians.
You have access to a database of technical manuals, failure logs, and repair guides.

Use the following Context to answer the user's question.
- If the answer is found in the context, cite the source title.
- If the answer is NOT in the context, use your general knowledge but mention "I couldn't find this in your files, but..."
- Be concise, technical, and accurate. Focus on repair data (temperatures, improved parts, known issues).

CONTEXT:
${contextText}
`;

        // 4. Generate Answer using Gemini Pro
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent([systemPrompt, `User Question: ${message}`]);
        const response = result.response.text();

        return NextResponse.json({
            answer: response,
            sources: documents?.map((doc: any) => doc.title)
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
