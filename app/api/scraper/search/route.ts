import { NextResponse } from 'next/server';
import { searchTavily, searchBrave, searchSerper } from '@/lib/researchProviders';
import { SearchResult } from '@/lib/types';
import { smartGenerate } from '@/lib/ai/openrouter';

export const maxDuration = 60; // Allow 1 minute for search & summarization

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const topic = body.topic || body.query;

        // Keys
        const tavilyKey = process.env.TAVILY_API_KEY;
        const braveKey = process.env.BRAVE_API_KEY;
        const serperKey = process.env.SERPER_API_KEY;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // 1. EXECUTE SMART DUAL-SEARCH ("The Sniper")
        // We fire multiple targeted queries locally to different providers or same provider with different focus.
        const promises = [];

        // QUERY A: General / Official Focus (Tavily)
        if (tavilyKey) {
            console.log(`🔎 [Research] Starting Primary Search (Tavily) for: ${topic}`);
            promises.push(searchTavily(topic, tavilyKey));
        }

        // QUERY B: Community Focus (Tavily)
        if (tavilyKey) {
            const communityQuery = `${topic} site:reddit.com OR site:bitcointalk.org OR site:stackoverflow.com "solved"`;
            console.log(`🔎 [Research] Starting Community Search (Tavily) for: ${communityQuery}`);
            promises.push(searchTavily(communityQuery, tavilyKey));
        }

        // QUERY C: Serper (Google Index) - General Focus
        // If we have Serper, we use it to get raw Google results which are often fresher/different than Tavily.
        if (serperKey) {
            console.log(`🔎 [Research] Starting Google Search (Serper) for: ${topic}`);
            promises.push(searchSerper(topic, serperKey));
        }

        // Backup Providers (if NO Tavily/Serper keys working)
        if (!tavilyKey && !serperKey && braveKey) promises.push(searchBrave(topic, braveKey));

        // Note: REMOVED GEMINI SEARCH (Grounding) because it is disabled for this user account (Limit 0).

        if (promises.length === 0) {
            return NextResponse.json({ error: 'No search providers configured (Add TAVILY_API_KEY or SERPER_API_KEY)' }, { status: 500 });
        }

        // Wait for all
        const providerResults = await Promise.all(promises);

        // 2. AGGREGATE, DEDUPLICATE & RE-RANK
        let allResults: SearchResult[] = [];
        const seenUrls = new Set<string>();
        const errors: string[] = [];
        const combinedSources: string[] = [];

        providerResults.forEach(p => {
            if (p.provider && !combinedSources.includes(p.provider)) {
                combinedSources.push(p.provider);
            }
            if (p.error) {
                errors.push(`${p.provider}: ${p.error}`);
            }
            if (p.results) {
                p.results.forEach(r => {
                    if (!seenUrls.has(r.url)) {
                        seenUrls.add(r.url);

                        // RE-RANKING LOGIC: Boost "Official" and "Reddit"
                        let weight = 1;
                        if (r.url.includes('reddit.com')) weight = 2;
                        if (r.url.includes('bitcointalk')) weight = 2;
                        if (r.url.includes('manual') || r.url.includes('pdf')) weight = 1.5;

                        // Fake score property for sorting if provider didn't give one
                        const score = (r.score || 0.5) * weight;

                        allResults.push({ ...r, source: p.provider, score });
                    }
                });
            }
        });

        // Sort by Boosted Score
        allResults.sort((a, b) => (b.score || 0) - (a.score || 0));

        // Limit total context (e.g., top 15 mixed results)
        allResults = allResults.slice(0, 15);

        // 3. GENERATE MASTER SUMMARY (Gemini as Reader, not Searcher)
        let summary = "";

        if (allResults.length > 0) {
            const contextText = allResults.map(r => `[${r.title}] (${r.url})\n${r.content}`).join('\n\n');
            const summaryPrompt = `
            Synthesize the following search results into a detailed Technical Analysis (4-5 sentences).
            TOPIC: ${topic}
            
            SEARCH RESULTS:
            ${contextText}
            
            Instructions:
            1. Prioritize "Official" specs and "Community Solved" posts.
            2. Ignore generic SEO spam.
            3. Highlight specific error codes, voltage values, or part numbers if found.
            `;

            try {
                // 'RESEARCHER' role = Gemini 2.0 Flash (Ideal for reading 15 results)
                summary = await smartGenerate('RESEARCHER', summaryPrompt, "You are a Senior Technical Researcher.");
            } catch (e) {
                console.error("SmartGenerate Summary Failed:", e);
                summary = "Summary generation failed, but raw results are available below.";
            }

            // 4. FORMAT KEY FINDINGS
            const keyFindings = allResults.map(r => `[${r.title}] ${r.content.substring(0, 150)}...`);

            return NextResponse.json({
                success: true,
                results: allResults,
                aiSummary: summary,
                keyFindings: keyFindings,
                sources: combinedSources
            });

        } else {
            // NO RESULTS FOUND
            let debugMsg = "No search results found.";
            if (errors.length > 0) {
                debugMsg += "\n\n⚠️ DEBUG ERRORS:\n" + errors.join('\n');
            }

            return NextResponse.json({
                success: true,
                results: [],
                aiSummary: debugMsg,
                keyFindings: [],
                sources: []
            });
        }

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
}
