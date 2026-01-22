import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testMimo() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("Testing Mimo with Key:", apiKey ? "Present" : "MISSING");

    const prompt = "Summarize the history of Bitcoin in 3 sentences.";

    try {
        console.log("Sending request to OpenRouter...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Debug"
            },
            body: JSON.stringify({
                "model": "xiaomi/mimo-v2-flash:free",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                // "reasoning": { "enabled": true } // Temporarily disable reasoning to see if that's the cause
            })
        });

        if (!response.ok) {
            console.error("Status:", response.status);
            console.error("Text:", await response.text());
            return;
        }

        const json = await response.json();
        console.log("Full JSON Response:", JSON.stringify(json, null, 2));

        const content = json.choices?.[0]?.message?.content;
        console.log("\n--- CONTENT START ---");
        console.log(content);
        console.log("--- CONTENT END ---\n");

    } catch (e: any) {
        console.error("Error:", e);
    }
}

testMimo();
