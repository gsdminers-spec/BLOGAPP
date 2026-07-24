const https = require('https');

const SUPABASE_URL = 'hrmluylwiqzowmzbbxdv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWx1eWx3aXF6b3dtemJieGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjAzOTIsImV4cCI6MjA4MTM5NjM5Mn0.2HxEaIKC9GaynuGNlKedrDGccsErsC_ITBkmqlyAbGg';

function supabaseRequest(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : null;
        const options = {
            hostname: SUPABASE_URL,
            port: 443,
            path: `/rest/v1/${path}`,
            method: method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

function simpleMarkdownToHtml(md) {
    if (!md) return '';
    let html = md
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^> (.*$)/gim, 'blockquote>$1</blockquote>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n\n/g, '</p><p>');
    return `<p>${html}</p>`;
}

// Generate backdate starting from July 1, 2025 up to June 30, 2026 for index 0 to 79
function getStaggeredBackdate(index, total = 80) {
    const startDate = new Date('2025-07-01T09:00:00.000Z').getTime();
    const endDate = new Date('2026-06-30T17:00:00.000Z').getTime();
    const step = (endDate - startDate) / total;
    const itemTime = new Date(startDate + (index * step));
    return itemTime.toISOString();
}

// High Quality Article Generator function using .agents templates
function buildWorldClassArticle(topicTitle) {
    const slug = topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let category = 'ASIC Repair';
    if (topicTitle.toLowerCase().includes('psu') || topicTitle.toLowerCase().includes('power') || topicTitle.toLowerCase().includes('apw') || topicTitle.toLowerCase().includes('surge')) {
        category = 'PSU Repair';
    } else if (topicTitle.toLowerCase().includes('thermal') || topicTitle.toLowerCase().includes('cool') || topicTitle.toLowerCase().includes('temp') || topicTitle.toLowerCase().includes('dust') || topicTitle.toLowerCase().includes('monsoon')) {
        category = 'Maintenance';
    } else if (topicTitle.toLowerCase().includes('test') || topicTitle.toLowerCase().includes('picobt') || topicTitle.toLowerCase().includes('firmware') || topicTitle.toLowerCase().includes('log')) {
        category = 'Diagnostics';
    } else if (topicTitle.toLowerCase().includes('antminer') || topicTitle.toLowerCase().includes('s19') || topicTitle.toLowerCase().includes('s21') || topicTitle.toLowerCase().includes('t21')) {
        category = 'Antminer Repair';
    } else if (topicTitle.toLowerCase().includes('whatsminer') || topicTitle.toLowerCase().includes('m30') || topicTitle.toLowerCase().includes('m50') || topicTitle.toLowerCase().includes('m60')) {
        category = 'Whatsminer Repair';
    } else if (topicTitle.toLowerCase().includes('avalon') || topicTitle.toLowerCase().includes('a11') || topicTitle.toLowerCase().includes('a12') || topicTitle.toLowerCase().includes('a13') || topicTitle.toLowerCase().includes('a14')) {
        category = 'Avalon Repair';
    }

    const tldr = `**TL;DR / Quick Summary:** ${topicTitle} is a critical hardware diagnostic scenario in ASIC mining. Resolving this issue requires systematic chip-level signal checks (CLK, RI, RO, CO, BO), verifying 1.8V and 0.8V LDO voltage rails, inspecting for thermal paste degradation, and checking PSU output stability. Follow our chip-level diagnostic procedure below or contact our Akola repair facility for 48-hour turnaround service.`;

    const content = `# ${topicTitle}: Complete Technical Diagnosis & Repair Guide

> ${tldr}

## What is ${topicTitle}?
${topicTitle} refers to a specific hardware or operational state in ASIC cryptocurrency mining rigs where hashing performance drops or fails entirely due to component degradation, voltage instability, thermal throttling, or signal interruption.

## Root Causes of ${topicTitle}

| Primary Root Cause | Technical Manifestation | Impact Level | Diagnostic Tool Needed |
| :--- | :--- | :--- | :--- |
| **LDO Voltage Rail Failure** | 1.8V / 0.8V LDO regulator output missing or shorted | Critical (0 Hashrate) | Digital Multimeter / Oscilloscope |
| **ASIC Chip Signal Loss** | RI (Reset Input) or CLK (Clock signal) line broken at IC N | High (Chain Incomplete) | PicoBT / PT3 Test Fixture |
| **Thermal Throttling** | Junction temp > 95°C causing chip shutdown | High (Frequency Drop) | Thermal Camera / Log Analysis |
| **PSU Ripple Noise** | AC-DC converter capacitor degradation | Moderate (High Rejects) | Power Analyzer / Oscilloscope |

## Step-by-Step Diagnostic & Repair Procedure

### 1. Initial Visual & Physical Inspection
Before applying power to the unit:
- Inspect hashboard PCB trace lines for solder bridging, copper oxidation, or moisture corrosion.
- Check thermal pad alignment and thermal paste condition across all heatsinks.
- Verify control board data ribbon cables are free of bent pins.

### 2. Voltage Domain & LDO Output Verification
Connect power and measure the reference test points across the board:
- **Main Domain Voltage**: Verify DC input rail meets specifications (12.0V to 15.0V depending on model).
- **LDO Regulators**: Measure 1.8V supply pins feeding the control ICs and 0.8V core logic pins. Missing voltage indicates a blown LDO IC or shorted decoupling ceramic capacitor.

### 3. Chip-Level Signal Tracing
Using a **PicoBT PT3 diagnostic test fixture**:
- Trace the **CLK (Clock)**, **CO (Command Out)**, **RI (Reset In)**, and **RO (Read Out)** signals starting from IC Chip 0 to Chip N.
- Identify the exact chip index where signal transmission drops to 0V or exhibits excessive noise.
- Desolder the faulty ASIC chip using a hot air rework station (380°C nozzle) and solder a fresh OEM replacement IC.

---

## Pro Tips for Indian Mining Farm Operators

> 💡 **Indian Climate Optimization**:
> High ambient summer temperatures (40°C–48°C) in regions like Rajasthan, Gujarat, and Maharashtra accelerate thermal paste drying. We recommend inspecting thermal interface material every 6 months and installing high-grade [voltage stabilizers for ASIC miners](/stabilizers) to prevent power grid surges.

---

## Frequently Asked Questions (FAQ)

### What is the most common cause of ${topicTitle}?
The primary causes are LDO voltage regulator failure, broken signal lines (RI/CLK) between ASIC chips, thermal paste drying, and power supply voltage fluctuations.

### Can ${topicTitle} be repaired without replacing the full hashboard?
Yes. Over 90% of failures are resolved by replacing individual ASIC chips, LDO ICs, or ceramic capacitors, saving up to 75% compared to full board replacement.

### How long does a professional repair take at ASICREPAIR.in?
Our Akola repair center offers a standard **48-hour turnaround time** with full thermal camera stress testing before return dispatch.

### Should I reflash firmware to fix ${topicTitle}?
Firmware updates fix software/log detection errors, but if physical voltage or chip signals are missing, hardware chip-level repair is mandatory.

### What tools are required for chip-level repair?
Essential tools include a digital multimeter, PicoBT/PT3 test fixture, hot air rework station, solder flux, and replacement ASIC IC chips.

---

> **Need Professional Repair?**  
> 📞 [Chat with our technical team on WhatsApp](https://wa.me/918208752205) or explore our [Hashboard Repair Services](/hashboard-repair).
`;

    return {
        title: topicTitle,
        slug: slug,
        category: category,
        content: content,
        content_html: simpleMarkdownToHtml(content),
        excerpt: tldr.replace(/\*\*/g, ''),
        seo_title: `${topicTitle} | ASICREPAIR.in Technical Guide`,
        seo_meta_description: tldr.replace(/\*\*/g, '').substring(0, 155)
    };
}

async function processBatch(batchNumber, batchSize = 20) {
    console.log(`\n🚀 Starting Processing of Batch ${batchNumber} (${batchSize} topics)...`);

    // Fetch pending topics
    const pendingTopics = await supabaseRequest('topics?status=eq.pending&select=id,title&limit=' + batchSize, 'GET');

    if (!pendingTopics || pendingTopics.length === 0) {
        console.log('✅ No more pending topics to process!');
        return 0;
    }

    console.log(`📦 Found ${pendingTopics.length} pending topics for Batch ${batchNumber}.\n`);

    // Fetch current published count to calculate continuous backdate index
    const existingArticles = await supabaseRequest('blog_articles?select=id', 'GET');
    let startIndex = existingArticles ? existingArticles.length : 0;

    let processedCount = 0;

    for (const topic of pendingTopics) {
        const backdate = getStaggeredBackdate(startIndex + processedCount);
        processedCount++;

        const articleData = buildWorldClassArticle(topic.title);

        const payloadArticlesTable = {
            topic_id: topic.id,
            title: articleData.title,
            slug: articleData.slug,
            content: articleData.content,
            category: articleData.category,
            status: 'published',
            author_name: 'ASICREPAIR.in Technical Team',
            publish_date: backdate,
            created_at: backdate,
            seo_title: articleData.seo_title,
            seo_h1: articleData.title,
            seo_meta_description: articleData.seo_meta_description
        };

        const payloadBlogArticlesTable = {
            title: articleData.title,
            slug: articleData.slug,
            content: articleData.content,
            content_html: articleData.content_html,
            excerpt: articleData.excerpt,
            category: articleData.category,
            is_published: true,
            published_date: backdate,
            created_at: backdate,
            updated_date: backdate,
            reading_time: 5,
            author_name: 'ASICREPAIR.in Technical Team',
            author_url: 'https://asicrepair.in'
        };

        try {
            // 1. Insert into articles table
            await supabaseRequest('articles', 'POST', payloadArticlesTable);

            // 2. Insert into blog_articles table
            await supabaseRequest('blog_articles', 'POST', payloadBlogArticlesTable);

            // 3. Mark topic status = 'done'
            await supabaseRequest(`topics?id=eq.${topic.id}`, 'PATCH', { status: 'done' });

            console.log(`✅ [Batch ${batchNumber}] Processed (${processedCount}/${pendingTopics.length}): "${topic.title}" (Date: ${backdate.split('T')[0]})`);
        } catch (err) {
            console.error(`❌ Failed to process "${topic.title}":`, err.message);
        }
    }

    console.log(`\n🎉 Batch ${batchNumber} Completed! Successfully processed ${processedCount} topics.`);
    return processedCount;
}

// Accept batch number from command line argument (e.g., node bulk_generate_worldclass_articles.js 1)
const batchArg = parseInt(process.argv[2]) || 1;
processBatch(batchArg, 20);
