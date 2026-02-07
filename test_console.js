require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.log('NO_API_KEY'); return; }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('--- TESTING 2.5 ---');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello!");
        console.log('SUCCESS_2_5');
        console.log(result.response.text());
    } catch (error) {
        console.log('FAILURE_2_5');
        console.log(error.message);

        console.log('--- TESTING 1.5 ---');
        try {
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await modelFallback.generateContent("Hello!");
            console.log('SUCCESS_1_5');
            console.log(result.response.text());
        } catch (fbError) {
            console.log('FAILURE_1_5');
            console.log(fbError.message);
        }
    }
}

testGemini();
