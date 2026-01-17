const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const modelList = await genAI.makeRequest('models', 'get');
        console.log("Available Models:");
        // The SDK might not expose makeRequest directly easily or return raw JSON.
        // Let's try the recommended way if possible, or just standard fetch if SDK is opaque.

        // Actually, the SDK doesn't have a simple listModels method in all versions.
        // I will use raw fetch to be sure.
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models found:", data);
        }

    } catch (err) {
        console.error("Error listing models:", err);
        if (err.cause) console.error("Cause:", err.cause);
    }
}

listModels();
