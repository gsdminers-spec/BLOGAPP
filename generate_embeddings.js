const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// --- Configuration ---
const INPUT_DIR = 'E:\\scraper2.0\\ALL_DATA\\03_KNOWLEDGE_BASE'; // Focus on KB first
const BATCH_SIZE = 10; // Files per batch to avoid rate limits

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

async function generateEmbedding(text) {
    // Truncate if too long (approx check, Gemini limit is ~2048 tokens for embedding model)
    const truncated = text.substring(0, 8000);
    const result = await model.embedContent(truncated);
    return result.embedding.values;
}

async function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            await processDirectory(fullPath);
        } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
            console.log(`Processing: ${file.name}`);
            await processFile(fullPath);
        }
    }
}

async function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const title = path.basename(filePath, path.extname(filePath));
        const relativePath = path.relative('E:\\scraper2.0\\ALL_DATA', filePath);
        const category = relativePath.split(path.sep)[0];

        // 1. Generate Embedding
        const embedding = await generateEmbedding(content);

        // 2. Upsert to Supabase
        const { error } = await supabase
            .from('research_documents') // Ensure this matches your table name
            .upsert({
                title: title,
                content: content, // Store full content for retrieval
                file_path: relativePath,
                category: category,
                embedding: embedding,
                updated_at: new Date()
            }, { onConflict: 'file_path' });

        if (error) {
            console.error(`Error saving ${title}:`, error.message);
        } else {
            console.log(`✅ Saved vector for: ${title}`);
        }

    } catch (err) {
        console.error(`Failed to process ${filePath}:`, err.message);
    }
}

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ Missing GEMINI_API_KEY");
        return;
    }
    console.log("🚀 Starting Embedding Generation...");

    // Process Knowledge Base first
    if (fs.existsSync(INPUT_DIR)) {
        await processDirectory(INPUT_DIR);
    } else {
        console.error(`Directory not found: ${INPUT_DIR}`);
    }

    console.log("🎉 Embedding generation complete!");
}

main();
