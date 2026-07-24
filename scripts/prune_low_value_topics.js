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

const PRUNE_TITLES = [
    'WhatsMiner D1 Decred Miner Hashboard Fix',
    'Antminer S9 Hashboard Dead',
    'ASIC Repair vs Replacement: How to Decide',
    'When ASIC Hashboard Repair Is Worth It',
    'When Replacing an ASIC Miner Makes More Sense',
    'ASIC Overheating Problems in Indian Summers',
    'Moisture and Humidity Damage in ASIC Mining Environments',
    'Voltage Fluctuation Damage in Indian Mining Setup',
    'Why ASIC Hashboards Fail After Power Outages',
    'When Hashboard Not Detected Needs Professional Repair',
    'How ASIC Repair Diagnostics Are Done at Chip Level',
    'Why Rebooting Does Not Fix Hardware ASIC Issues',
    'Common Misdiagnoses in ASIC Miner Failures',
    'Difference Between Software Errors and Hardware Damage in ASIC Miners',
    'Why a Hashboard Can Be Intermittently Detected',
    'What Causes Hashboard Communication Failure',
    'Why One Hashboard Fails While Others Work',
    'What Happens During Professional ASIC Hashboard Repair',
    'Repairable vs Non-Repairable ASIC Hashboard Damage',
    'Why Delayed ASIC Repair Increases Cost',
    'How Repeated Restarts Can Worsen Hardware Damage',
    'Cost Impact of Ignoring Early ASIC Failure Signs',
    'How to Reduce Downtime With Timely ASIC Repair'
];

async function pruneLowValueTopics() {
    console.log('🗑️ Starting Pruning of 23 Low-Value / Duplicate Topics from Supabase...\n');

    let deletedCount = 0;

    for (const title of PRUNE_TITLES) {
        try {
            // Find topic by exact title match
            const found = await supabaseRequest(`topics?title=eq.${encodeURIComponent(title)}&select=id,title`, 'GET');

            if (found && found.length > 0) {
                for (const t of found) {
                    await supabaseRequest(`topics?id=eq.${t.id}`, 'DELETE');
                    console.log(`✅ Deleted topic: "${t.title}" (ID: ${t.id})`);
                    deletedCount++;
                }
            } else {
                console.log(`ℹ️ Topic not found or already deleted: "${title}"`);
            }
        } catch (err) {
            console.error(`❌ Error deleting "${title}":`, err.message);
        }
    }

    console.log(`\n🎉 Pruning Complete! Successfully removed ${deletedCount} low-value topics.`);

    // Check remaining pending topics
    const remaining = await supabaseRequest('topics?status=eq.pending&select=id', 'GET');
    console.log(`📊 Clean Remaining Pending Topics Pool: ${remaining.length} topics.`);
}

pruneLowValueTopics();
