require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Test 2.5
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello!");
        fs.writeFileSync('status_2.5.txt', 'SUCCESS: ' + result.response.text());
    } catch (error) {
        fs.writeFileSync('status_2.5.txt', 'FAILURE: ' + error.message);

        // Test 1.5 Fallback
        try {
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await modelFallback.generateContent("Hello!");
            fs.writeFileSync('status_1.5.txt', 'SUCCESS: ' + result.response.text());
        } catch (fbError) {
            fs.writeFileSync('status_1.5.txt', 'FAILURE: ' + fbError.message);
        }
    }
}

testGemini();
