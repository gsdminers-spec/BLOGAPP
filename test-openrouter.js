const OPENROUTER_API_KEY = "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";

const MODELS_TO_TEST = [
    // RESEARCHER
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-2.0-pro-exp-02-05:free",

    // REASONER
    "openai/gpt-oss-120b:free", // Does this exist?
    "deepseek/deepseek-r1:free",

    // OUTLINER
    "meta-llama/llama-3-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",

    // WRITER (Reuse)
];

async function testModel(modelId) {
    console.log(`\nTesting: ${modelId}...`);
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Test",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: "user", content: "Say 'OK' if you exist." }],
                temperature: 0.7,
                top_p: 0.9,
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.log(`❌ FAILED [${response.status}]: ${err.substring(0, 100)}`);
            return false;
        }

        const data = await response.json();
        if (data.error) {
            console.log(`❌ API ERROR: ${JSON.stringify(data.error)}`);
            return false;
        }

        console.log(`✅ SUCCESS. Output: "${data.choices?.[0]?.message?.content?.trim()}"`);
        return true;

    } catch (e) {
        console.log(`❌ EXCEPTION: ${e.message}`);
        return false;
    }
}

(async () => {
    console.log("--- Starting OpenRouter Committee Audit ---");
    for (const model of MODELS_TO_TEST) {
        await testModel(model);
    }
})();
