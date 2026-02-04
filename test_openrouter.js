require('dotenv').config({ path: '.env.local' });

async function testOpenRouter() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error("❌ FAIL: Missing OPENROUTER_API_KEY in .env.local");
        return;
    }

    console.log("🧪 Testing OpenRouter (DeepSeek R1 Free)...");
    console.log("Packet: Sending verification request...");

    const fs = require('fs');

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Test Script"
            },
            body: JSON.stringify({
                "model": "tngtech/deepseek-r1t2-chimera:free",
                "messages": [{
                    "role": "user",
                    "content": "Verify this fact: The Antminer S19 Pro uses 12.0V nominal voltage. Return 'VERIFIED' or 'FALSE'."
                }]
            })
        });

        const statusText = `📡 Status: ${response.status} ${response.statusText}`;
        console.log(statusText);

        if (!response.ok) {
            const errorText = await response.text();
            fs.writeFileSync('openrouter_status.txt', `FAILURE\n${statusText}\nBody: ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices && data.choices[0] ? data.choices[0].message.content : "No content returned";

        fs.writeFileSync('openrouter_status.txt', `SUCCESS\nResponse: ${content}`);
        console.log("✅ SUCCESS: Check openrouter_status.txt");

    } catch (error) {
        console.error("❌ FAIL:", error.message);
        if (!fs.existsSync('openrouter_status.txt')) {
            fs.writeFileSync('openrouter_status.txt', `CRITICAL FAILURE\n${error.message}`);
        }
    }
}

testOpenRouter();
