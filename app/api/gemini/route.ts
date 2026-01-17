import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt, task } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        // Gemini API endpoint
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error: `Gemini API error: ${error}` }, { status: response.status });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return NextResponse.json({
            success: true,
            result: text,
            task
        });

    } catch (error) {
        console.error('Gemini API error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
