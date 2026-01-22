import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGeminiContent() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("Testing Gemini Lite Content generation (No Reasoning Param)...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Researcher Debug"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                "messages": [{
                    "role": "user",
                    "content": `Context: ${"A".repeat(20000)}\n\nTask: Summarize the context.`
                }]
                // REMOVED REASONING PARAM
            })
        });

        if (!response.ok) {
            console.error("HTTP ERROR:", response.status, await response.text());
            return;
        }

        const json = await response.json();
        const content = json.choices[0]?.message?.content;

        console.log("--- CONTENT START ---");
        console.log(content);
        console.log("--- CONTENT END ---\n");

        if (!content) console.error("FATAL: Content is empty/null");

    } catch (e: any) {
        console.error("Script Error:", e.message);
    }
}

testGeminiContent();
