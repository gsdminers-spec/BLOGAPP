/**
 * Regenerate: Antminer S21 Pro Hashboard Not Detected
 * Using Production Blog Brain v3.0 (Peak Edition)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { runCommittee, validateWordCount, ArticleType } from '../lib/ai/committee';

async function regenerateArticle() {
    console.log('\n🔄 REGENERATING ARTICLE WITH v3.0 PIPELINE\n');
    console.log('='.repeat(70));

    const topic = 'Antminer S21 Pro Hashboard Not Detected';
    const articleType: ArticleType = 'model_problem';

    // Research context (simulated - normally comes from Tavily/Serper)
    const researchContext = `
## Research Data for Antminer S21 Pro Hashboard Not Detected

- The Antminer S21 Pro is Bitmain's latest SHA-256 miner (200 TH/s)
- "Hashboard not detected" typically indicates complete chain failure
- Common symptoms: Kernel logs show "ERROR_SOC_INIT", dashboard shows 0 TH/s for one chain
- Root causes: ASIC chip failure, voltage domain collapse, damaged PIC microcontroller
- Environmental factors in India: High humidity causes corrosion, dust clogs heatsinks
- Professional repair requires: Hot air rework station, microscope, proprietary test fixtures
- DIY attempts often result in permanent PCB damage due to incorrect reflow temperatures
- Revenue loss: $15-20/day per chain at current BTC prices
    `;

    console.log(`📝 Topic: ${topic}`);
    console.log(`📁 Type: ${articleType}`);
    console.log('='.repeat(70));
    console.log('\n⏳ Generating 6 sections...\n');

    try {
        const startTime = Date.now();
        const result = await runCommittee(topic, researchContext, articleType);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n⏱️ Generation completed in ${duration}s\n`);
        console.log('='.repeat(70));

        // SEO Meta
        console.log('\n📊 SEO META:');
        console.log(`  Title: ${result.seoMeta.title}`);
        console.log(`  H1: ${result.seoMeta.h1}`);
        console.log(`  Meta (${result.seoMeta.metaDescription.length} chars): ${result.seoMeta.metaDescription}`);

        // Section Count
        console.log(`\n📖 SECTIONS: ${result.sections.length}/6`);

        // Word Count
        const validation = validateWordCount(result.finalArticle, articleType);
        console.log(`📏 WORDS: ${validation.count} (Range: ${validation.target}) ${validation.valid ? '✅' : '⚠️'}`);

        // Print FULL article
        console.log('\n' + '='.repeat(70));
        console.log('📄 FULL ARTICLE (v3.0 Compliant):');
        console.log('='.repeat(70));
        console.log(result.finalArticle);
        console.log('='.repeat(70));

        if (result.error) {
            console.log(`\n⚠️ Note: ${result.error}`);
        }

    } catch (error: any) {
        console.error('\n❌ GENERATION FAILED:', error.message);
        process.exit(1);
    }
}

regenerateArticle();
