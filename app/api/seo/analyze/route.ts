
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, keyword } = body;

        if (!content) return NextResponse.json({ error: 'Content missing' }, { status: 400 });

        const mockAnalysis = {
            score: content.length > 2000 ? 85 : 60,
            missingKeywords: ['capacitor check', 'voltage rail', 'thermal paste'],
            suggestions: [
                'Add a step-by-step diagnostic table.',
                'Include safety warnings about high voltage.',
                `Ensure the keyword "${keyword || 'Main Topic'}" appears in the first paragraph.`
            ]
        };

        return NextResponse.json({ success: true, analysis: mockAnalysis });

    } catch (error) {
        // unused var check fix - use error or ignore
        const errorMessage = error instanceof Error ? error.message : 'Unknown';
        // Just returning generic error to avoid 'unused' warning if we don't log it
        return NextResponse.json({ error: 'Analysis failed', details: errorMessage }, { status: 500 });
    }
}
