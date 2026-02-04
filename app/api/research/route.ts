import { NextResponse } from 'next/server';
import { searchTavily, searchSerper } from '@/lib/researchProviders';
import { runCommittee } from '@/lib/ai/committee';
import { mimoResearch } from '@/lib/ai/researcher';

// Allow long running processes (up to 5 mins)
export const maxDuration = 300;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, topic, researchContext } = body;

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

            // 2. Synthesize & Filter Context (The "Smart Feed")
            const allResults = [
                ...tavilyGeneral.results,
                ...tavilyCommunity.results,
                ...serperGoogle.results
            ];

            // A. Quality Filter
            const qualityResults = allResults.filter(r => {
                const content = r.content || "";
                // 1. Length Check (Skip thin content)
                if (content.length < 150) return false;
                // 2. Duplicate Check (Basic URL check - could be improved)
                return true;
            }).map(r => {
                // B. Scoring/Boost (Simple Heuristic)
                let qualityScore = 1;
                const lowerUrl = r.url.toLowerCase();
                if (lowerUrl.includes('reddit.com')) qualityScore += 2; // High signal for repairs
                if (lowerUrl.includes('bitcointalk.org')) qualityScore += 3; // Gold mine for ASIC
                if (lowerUrl.includes('stackoverflow.com')) qualityScore += 2;
                if (lowerUrl.includes('zeusbtc')) qualityScore += 2; // Competitor/Source data

                return { ...r, qualityScore };
            }).sort((a, b) => b.qualityScore - a.qualityScore); // Sort by Quality

            // C. Format to Markdown (The "Feed")
            let rawData = "## 🧠 HIGH-QUALITY RESEARCH DATA (Structured Feed)\n\n";

            // Limit to top 15 sources to avoid context overflow, even with 17B model
            qualityResults.slice(0, 15).forEach((r, index) => {
                rawData += `### [${index + 1}] ${r.title}\n`;
                rawData += `**Source**: ${r.url}\n`;
                rawData += `**relevance**: ${r.qualityScore > 1 ? '🔥 High Signal' : 'Standard'}\n`;
                rawData += `> ${r.content.replace(/\n/g, ' ')}\n\n`;
            });

            console.log(`✅ Smart Feed Generated: ${qualityResults.length} filtered sources.`);

            // 3. AI Synthesis (The "Research Agent")
            console.log("🧠 [Research] Synthesizing Master Fact Sheet with Gemini 2.5...");

            try {
                const mimo = await mimoResearch(topic, rawData);

                if (mimo.error) {
                    throw new Error(mimo.error);
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        rawSources: allResults,
                        factSheet: mimo.content, // AI Generated Summary
                        reasoning: "Synthesized by Gemini 2.5 Flash"
                    }
                });

            } catch (aiError: any) {
                console.error("⚠️ Research Agent Failed, falling back to Raw Feed:", aiError);
                // Fallback to Raw Data if AI fails
                return NextResponse.json({
                    success: true,
                    data: {
                        rawSources: allResults,
                        factSheet: rawData + "\n\n> **Note:** AI Synthesis failed. Showing raw gathered data.",
                        reasoning: "Fallback: AI Error"
                    }
                });
            }
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

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("API Error:", errorMessage);
        return NextResponse.json({ error: errorMessage || "Internal Server Error" }, { status: 500 });
    }
}
