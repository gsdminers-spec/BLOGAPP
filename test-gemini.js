const { GoogleGenerativeAI } = require('@google/generative-ai');

(async () => {
    try {
        console.log("Using Key: AIzaSy...Iwy4");
        const genAI = new GoogleGenerativeAI('AIzaSyAS4h6RFL2jKTR95xMn0Ynn_YyJdgZIwy4');

        console.log("\n--- Testing gemini-2.0-flash-exp ---");
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        try {
            const result = await model.generateContent('Are you online? Reply with YES.');
            console.log("✅ 2.0-flash-exp WORKS! Response:", result.response.text());
        } catch (e) {
            console.log("❌ 2.0-flash-exp FAILED:", e.message);
            console.log("Details:", JSON.stringify(e, null, 2));
        }

    } catch (e) {
        console.error("Global Scrip Error:", e);
    }
})();
