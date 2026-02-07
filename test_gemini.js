require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const LOG_FILE = 'test_output.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\r\n'); // Use CRLF for Windows readability
}

async function testGemini() {
    try {
        fs.writeFileSync(LOG_FILE, '');
    } catch (e) { }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        log('❌ Error: GEMINI_API_KEY is missing in .env.local');
        return;
    }

    log(`🔑 API Key Found: ${apiKey.substring(0, 5)}...`);
    log('📡 Connecting to Google AI Studio...');

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // TARGET MODEL: gemini-2.5-flash
        const modelName = "gemini-2.5-flash";
        log(`🤖 Testing Model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello!");
        log('✅ SUCCESS with gemini-2.5-flash!');
        log(`📝 Response: ${result.response.text()}`);

    } catch (error) {
        log('❌ FAILURE with gemini-2.5-flash!');
        log('----------- FULL ERROR -----------');
        log(`Message: ${error.message}`);
        try {
            log(JSON.stringify(error, null, 2));
        } catch (e) { log('Could not stringify error object'); }

        log('\r\n🔄 Attempting Fallback: gemini-1.5-flash ...');
        try {
            // Fallback to older model
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await modelFallback.generateContent("Hello!");
            log('✅ SUCCESS with gemini-1.5-flash!');
            log(`📝 Response: ${result.response.text()}`);
        } catch (fbError) {
            log('❌ FALLBACK FAILED TOO.');
            log(`Message: ${fbError.message}`);
        }
    }
}

testGemini();
