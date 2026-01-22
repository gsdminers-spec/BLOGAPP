import { NextResponse } from 'next/server';
import { searchTavily, searchSerper } from '@/lib/researchProviders';
import { mimoResearch } from '@/lib/ai/researcher';
import { runCommittee } from '@/lib/ai/committee';

// Allow long running processes (up to 5 mins)
export const maxDuration = 300;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, topic, researchContext, outline, verification } = body;

        // --- STEP 1: RESEARCH (The Lab) ---
        if (action === 'research') {
            if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

            console.log(`🔬 [Research] Starting Deep Dive for: ${topic}`);

            // 1. Parallel Search (Tri-Engine)
            const [tavilyGeneral, tavilyCommunity, serperGoogle] = await Promise.all([
                searchTavily(topic, process.env.TAVILY_API_KEY!),
                searchTavily(`${topic} site:reddit.com OR site:stackoverflow.com "solved"`, process.env.TAVILY_API_KEY!),
                searchSerper(topic, process.env.SERPER_API_KEY!)
            ]);

            // 2. Synthesize Context
            let rawData = "";
            tavilyGeneral.results.forEach(r => rawData += `[Source: ${r.title}](${r.url})\n${r.content}\n\n`);
            tavilyCommunity.results.forEach(r => rawData += `[Community: ${r.title}](${r.url})\n${r.content}\n\n`);
            serperGoogle.results.forEach(r => rawData += `[Google: ${r.title}](${r.url})\n${r.content}\n\n`);

            // 3. Mimo Analysis
            const researcher = await mimoResearch(topic, rawData);

            if (researcher.error || !researcher.content) {
                console.error("Researcher Agent Error:", researcher.error);
                return NextResponse.json({
                    success: false,
                    error: researcher.error || "Researcher returned empty content."
                });
            }

            return NextResponse.json({
                success: true,
                data: {
                    rawSources: [...tavilyGeneral.results, ...tavilyCommunity.results, ...serperGoogle.results],
                    factSheet: researcher.content,
                    reasoning: researcher.reasoning
                }
            });
        }

        // --- STEP 2: DRAFT (The Studio) ---
        if (action === 'draft') {
            if (!topic || !researchContext) return NextResponse.json({ error: "Topic and Context required" }, { status: 400 });

            console.log(`✍️ [Draft] Starting Committee for: ${topic}`);

            // Execute the Writer Committee
            const result = await runCommittee(topic, researchContext);

            if (result.error) {
                return NextResponse.json({ success: false, error: result.error });
            }

            return NextResponse.json({
                success: true,
                data: result
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (e: any) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
