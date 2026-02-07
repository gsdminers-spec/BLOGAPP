/**
 * Test Script: Production Blog Brain v3.0 Generation
 * Run with: npx tsx scripts/test-generation.ts
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { runCommittee, validateWordCount, ArticleType } from '../lib/ai/committee';

async function testGeneration() {
    console.log('\n🧪 PRODUCTION BLOG BRAIN v3.0 - TEST\n');
    console.log('='.repeat(60));

    const testTopic = 'Antminer S19 Pro Zero Hashrate';
    const articleType: ArticleType = 'model_problem';

    // Mock research context
    const mockResearchContext = `
## Research Data
- Antminer S19 Pro is a SHA-256 Bitcoin miner
- Zero hashrate typically indicates hashboard failure
- Common causes: chip failure, voltage regulator issues, thermal damage
- Users report: kernel logs showing "Hardware Error", dashboard shows 0 TH/s
- Professional repair requires hot air rework stations and microscopes
    `;

    console.log(`📝 Topic: ${testTopic}`);
    console.log(`📁 Type: ${articleType}`);
    console.log('='.repeat(60));
    console.log('\n⏳ Generating article section-by-section...\n');

    try {
        const startTime = Date.now();
        const result = await runCommittee(testTopic, mockResearchContext, articleType);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n⏱️ Generation completed in ${duration}s\n`);
        console.log('='.repeat(60));

        // Check for errors
        if (result.error) {
            console.log(`\n⚠️ Partial Error: ${result.error}`);
        }

        // SEO Meta
        console.log('\n📊 SEO META:');
        console.log(`  Title: ${result.seoMeta.title}`);
        console.log(`  H1: ${result.seoMeta.h1}`);
        console.log(`  Meta Desc (${result.seoMeta.metaDescription.length} chars): ${result.seoMeta.metaDescription}`);

        // Section Count
        console.log(`\n📖 SECTIONS GENERATED: ${result.sections.length}/6`);

        // Word Count Validation
        const validation = validateWordCount(result.finalArticle, articleType);
        console.log(`\n📏 WORD COUNT: ${validation.count} (Expected: ${validation.target})`);
        console.log(`   Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);

        // Print article preview
        console.log('\n' + '='.repeat(60));
        console.log('📄 ARTICLE PREVIEW (first 1000 chars):');
        console.log('-'.repeat(60));
        console.log(result.finalArticle.substring(0, 1000) + '...');
        console.log('-'.repeat(60));

        // Success summary
        console.log('\n✅ TEST COMPLETE');
        console.log(`   Sections: ${result.sections.length === 6 ? '✅' : '❌'} ${result.sections.length}/6`);
        console.log(`   Word Count: ${validation.valid ? '✅' : '⚠️'} ${validation.count} words`);
        console.log(`   SEO Title: ${result.seoMeta.title ? '✅' : '❌'}`);

    } catch (error: any) {
        console.error('\n❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

testGeneration();
