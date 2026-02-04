
// Script to seed the database with initial Blog Tree structure from lib/blogTreeData.ts
// Run this via a temporary UI button or console

import { supabase } from './supabase';
import { BLOG_TREE_DATA } from './blogTreeData';

export async function seedDatabase() {
    console.log('🌱 Starting seed...');
    let phaseCount = 0;
    let catCount = 0;
    let subCount = 0;
    let topicCount = 0;

    for (const phase of BLOG_TREE_DATA) {
        // 1. Insert Phase
        const { data: phaseData, error: phaseError } = await supabase
            .from('phases')
            .insert({
                name: phase.name,
                description: phase.description,
                order: phase.id,
                article_count: 0
            })
            .select()
            .single();

        if (phaseError) { console.error('Phase Error:', phaseError); continue; }
        phaseCount++;

        for (const cat of phase.categories) {
            // 2. Insert Category
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .insert({
                    phase_id: phaseData.id,
                    name: cat.name,
                    article_count: 0
                })
                .select()
                .single();

            if (catError) { console.error('Cat Error:', catError); continue; }
            catCount++;

            for (const sub of cat.subcategories || []) {
                // 3. Insert Subcategory
                const { data: subData, error: subError } = await supabase
                    .from('subcategories')
                    .insert({
                        category_id: catData.id,
                        name: sub.name,
                        article_count: sub.topics.length
                    })
                    .select()
                    .single();

                if (subError) { console.error('Sub Error:', subError); continue; }
                subCount++;

                // 4. Insert Topics
                const topics = sub.topics.map(t => ({
                    subcategory_id: subData.id,
                    title: t.title,
                    status: 'pending' // Default status
                }));

                const { error: topicError } = await supabase.from('topics').insert(topics);
                if (topicError) console.error('Topic Error:', topicError);
                else topicCount += topics.length;
            }
        }
    }

    return { success: true, counts: { phaseCount, catCount, subCount, topicCount } };
}
