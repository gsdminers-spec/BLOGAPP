import { NextResponse } from 'next/server';
import { smartGenerate } from '@/lib/ai/openrouter';

export const maxDuration = 300; // Allow 5 minutes for the full consensus chain

export async function POST(req: Request) {
    try {
        const { topic, scrapedData, preferences } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // -----------------------------------------------------------------------
        // STEP 0: PREPARE CONTEXT
        // -----------------------------------------------------------------------
        const researchContext = scrapedData
            ? `RESEARCH DATA:\n${JSON.stringify(scrapedData)}\n\n`
            : 'NO RESEARCH DATA AVAILABLE. Rely on your internal knowledge.\n\n';

        const userNotes = preferences?.additionalNotes
            ? `USER NOTES: ${preferences.additionalNotes}\n\n`
            : '';

        console.log(`🚀 [Deep Consensus] Starting generation for: "${topic}"`);

        // -----------------------------------------------------------------------
        // STEP 1: THE RESEARCHER (Synthesize technical facts)
        // -----------------------------------------------------------------------
        const researcherPrompt = `
        ANALYZE the provided research data and extraction Technical Facts for the topic: "${topic}".
        
        ${researchContext}

        OUTPUT FORMAT:
        - List of Technical Specifications
        - List of Common Failure Points
        - List of Repair/Diagnostic Steps
        - Any conflicting information found in the data
        
        Keep it purely factual. No fluff.
        `;

        const phase1Result = await smartGenerate('RESEARCHER', researcherPrompt, "You are a Senior Technical Researcher.");
        console.log("✅ [Phase 1] Researcher complete.");

        // -----------------------------------------------------------------------
        // STEP 2: THE REASONER (Deep Dive & Logic Check)
        // -----------------------------------------------------------------------
        const reasonerPrompt = `
        Review these Technical Facts and provide a "Deep Dive" analysis.
        
        TOPIC: ${topic}
        FACTS:
        ${phase1Result}

        GOAL:
        - Explain *WHY* these failures happen (Root Cause Analysis).
        - Identify any logical gaps in the repair steps.
        - Add expert "Pro Tips" that aren't obvious provided inputs.
        - Create a "Theory of Operation" for the device/component.
        
        ${userNotes}
        `;

        const phase2Result = await smartGenerate('REASONER', reasonerPrompt, "You are a Principal Engineer and Logic Analyst.");
        console.log("✅ [Phase 2] Reasoner complete.");

        // -----------------------------------------------------------------------
        // STEP 3: THE OUTLINER (Structural Skeleton)
        // -----------------------------------------------------------------------
        const outlinerPrompt = `
        Create a perfect Blog Post Outline for: "${topic}".
        
        Reflect the "Deep Dive" insights in the structure.
        
        INSIGHTS:
        ${phase2Result}

        REQUIREMENTS:
        - SEO-optimized H1 Title.
        - Logical H2/H3 hierarchy.
        - Section for "Diagnostics", "Tools Needed", and "Step-by-Step Repair".
        - FAQ Section.
        
        Output *ONLY* the Markdown Outline.
        `;

        const phase3Result = await smartGenerate('OUTLINER', outlinerPrompt, "You are a Content Strategist.");
        console.log("✅ [Phase 3] Outliner complete.");

        // -----------------------------------------------------------------------
        // STEP 4: THE WRITER (Final Content Generation)
        // -----------------------------------------------------------------------
        const writerPrompt = `
        Write the FULL Final Blog Article.
        
        TOPIC: ${topic}
        OUTLINE:
        ${phase3Result}
        
        TECHNICAL DEEP DIVE (Incorporate these insights!):
        ${phase2Result}
        
        RAW FACTS:
        ${phase1Result}
        
        ${userNotes}

        TONE: Professional, Authoritative, Technician-focused.
        FORMAT: Markdown.
        `;

        const finalArticle = await smartGenerate('WRITER', writerPrompt, "You are an Expert Technical Writer.");
        console.log("✅ [Phase 4] Writer complete.");

        return NextResponse.json({ success: true, article: finalArticle, debug: { p1: phase1Result, p2: phase2Result, p3: phase3Result } });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Deep Consensus Error:', errorMessage);
        return NextResponse.json({ error: errorMessage || 'Failed to generate article' }, { status: 500 });
    }
}
