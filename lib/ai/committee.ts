import { Groq } from 'groq-sdk';

/**
 * PRODUCTION BLOG BRAIN v3.0 (Peak Edition - FULL SPEC)
 * 
 * HARD RULES (NON-NEGOTIABLE):
 * - Do NOT explain repair steps
 * - Do NOT mention tools, equipment, temperatures, soldering, reflow, microscopes, IPC standards
 * - Do NOT give DIY advice or "what to try"
 * - Do NOT decode logs line by line
 * - Do NOT mention money, profit, ROI, revenue, or cost figures
 * - Do NOT use sales language (free quote, best, guaranteed)
 * - Do NOT add FAQs, tips, summaries, conclusions, or extra sections
 * 
 * WORD COUNT MODE: DEPTH-FIRST (MANDATORY)
 * - Target UPPER-MIDDLE of allowed range
 * - Treat lower bound as INVALID
 * - Writing close to minimum is a failure
 * 
 * GOVERNING PRINCIPLE:
 * If an article helps someone fix a miner, it is WRONG.
 * If it helps someone decide to seek repair, it is CORRECT.
 */

// --- TYPE DEFINITIONS ---
export type ArticleType = 'model_problem' | 'support' | 'environmental' | 'repair_decision';

interface SectionDefinition {
    id: number;
    name: string;
    h2: string;
    promptFocus: string;
    minWords: number; // Section minimum word count
}

interface CommitteeOutput {
    seoOutline: string;
    seoMeta: {
        title: string;
        h1: string;
        metaDescription: string;
    };
    sections: string[];
    finalArticle: string;
    error?: string;
}

// --- WORD COUNT TARGETS (DEPTH-FIRST MODE) ---
// Target: UPPER-MIDDLE of range, Hard reject: minimum threshold
export const WORD_TARGETS: Record<ArticleType, { target: { min: number; max: number }; hardReject: number }> = {
    model_problem: { target: { min: 900, max: 1050 }, hardReject: 850 },
    support: { target: { min: 1000, max: 1200 }, hardReject: 900 },
    environmental: { target: { min: 1100, max: 1300 }, hardReject: 1000 },
    repair_decision: { target: { min: 800, max: 950 }, hardReject: 750 },
};

// --- LOCKED 6-SECTION STRUCTURE WITH MINIMUM WORD COUNTS ---
const SECTION_DEFINITIONS: Record<ArticleType, SectionDefinition[]> = {
    model_problem: [
        { id: 1, name: 'problem_meaning', h2: 'What the Problem Means', promptFocus: 'Explain the issue at a system level. Describe communication, detection, or stability failure. Make it clear this is not a normal software issue. Do NOT declare complete or final failure. Do NOT diagnose specific components.', minWords: 180 },
        { id: 2, name: 'symptoms', h2: 'Symptoms You May Observe', promptFocus: 'Describe what the miner owner actually sees: missing hashboard, low hashrate, restarts, instability. No fixes, no advice, no numbers.', minWords: 140 },
        { id: 3, name: 'root_causes', h2: 'Why This Happens', promptFocus: 'Explain causes at a concept level only. Examples: heat stress, power instability, electrical wear, environment. Do NOT name specific chips or board components unless unavoidable. Do NOT explain how damage is repaired.', minWords: 220 },
        { id: 4, name: 'consequences', h2: 'What Happens If Ignored', promptFocus: 'Explain how the problem worsens over time. Describe increased instability, wider damage risk, and downtime. Use calm urgency. No fear tactics and no money figures.', minWords: 150 },
        { id: 5, name: 'professional_repair', h2: 'When Professional Repair Is Required', promptFocus: 'Clearly define the decision boundary. Explain why restarts, firmware changes, or waiting will not solve it. State that specialized expertise is required. Do NOT describe repair methods or tools.', minWords: 150 },
        { id: 6, name: 'cta', h2: 'WhatsApp CTA', promptFocus: 'Output ONLY this exact line: "Chat with our ASIC repair team on WhatsApp to check repair feasibility." Nothing else.', minWords: 0 },
    ],
    support: [
        { id: 1, name: 'problem_meaning', h2: 'What the Problem Means', promptFocus: 'Explain the issue at a system level.', minWords: 200 },
        { id: 2, name: 'symptoms', h2: 'Symptoms You May Observe', promptFocus: 'Describe what the miner owner actually sees.', minWords: 160 },
        { id: 3, name: 'root_causes', h2: 'Why This Happens', promptFocus: 'Explain causes at a concept level only.', minWords: 250 },
        { id: 4, name: 'consequences', h2: 'What Happens If Ignored', promptFocus: 'Explain how the problem worsens over time.', minWords: 170 },
        { id: 5, name: 'professional_repair', h2: 'When Professional Repair Is Required', promptFocus: 'Clearly define the decision boundary.', minWords: 170 },
        { id: 6, name: 'cta', h2: 'WhatsApp CTA', promptFocus: 'Output ONLY the exact CTA line.', minWords: 0 },
    ],
    environmental: [
        { id: 1, name: 'problem_meaning', h2: 'What the Problem Means', promptFocus: 'Explain the issue at a system level.', minWords: 220 },
        { id: 2, name: 'symptoms', h2: 'Symptoms You May Observe', promptFocus: 'Describe what the miner owner actually sees.', minWords: 180 },
        { id: 3, name: 'root_causes', h2: 'Why This Happens', promptFocus: 'Explain causes at a concept level only.', minWords: 280 },
        { id: 4, name: 'consequences', h2: 'What Happens If Ignored', promptFocus: 'Explain how the problem worsens over time.', minWords: 190 },
        { id: 5, name: 'professional_repair', h2: 'When Professional Repair Is Required', promptFocus: 'Clearly define the decision boundary.', minWords: 180 },
        { id: 6, name: 'cta', h2: 'WhatsApp CTA', promptFocus: 'Output ONLY the exact CTA line.', minWords: 0 },
    ],
    repair_decision: [
        { id: 1, name: 'problem_meaning', h2: 'What the Problem Means', promptFocus: 'Explain the issue at a system level.', minWords: 150 },
        { id: 2, name: 'symptoms', h2: 'Symptoms You May Observe', promptFocus: 'Describe what the miner owner actually sees.', minWords: 120 },
        { id: 3, name: 'root_causes', h2: 'Why This Happens', promptFocus: 'Explain causes at a concept level only.', minWords: 180 },
        { id: 4, name: 'consequences', h2: 'What Happens If Ignored', promptFocus: 'Explain how the problem worsens over time.', minWords: 130 },
        { id: 5, name: 'professional_repair', h2: 'When Professional Repair Is Required', promptFocus: 'Clearly define the decision boundary.', minWords: 130 },
        { id: 6, name: 'cta', h2: 'WhatsApp CTA', promptFocus: 'Output ONLY the exact CTA line.', minWords: 0 },
    ],
};

// --- HELPER: Validate Word Count ---
export function validateWordCount(content: string, type: ArticleType): { valid: boolean; count: number; target: string; hardReject: number } {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const targets = WORD_TARGETS[type];
    return {
        valid: wordCount >= targets.hardReject,
        count: wordCount,
        target: `${targets.target.min}-${targets.target.max}`,
        hardReject: targets.hardReject,
    };
}

// Kept for backward compatibility
export const WORD_LIMITS = WORD_TARGETS;

// --- THE COMPLETE SYSTEM PROMPT ---
const getSystemPrompt = (model: string, problem: string) => `SYSTEM ROLE:
You are an ASIC Repair Analyst, not a technician.

Your role is to explain ASIC hardware failures clearly and help miner owners decide when professional repair is required.

You must NEVER teach, demonstrate, or describe how repairs are done.

CORE PURPOSE:
Explain failure → explain risk → explain decision → guide to WhatsApp.
Nothing else.

HARD RULES (NON-NEGOTIABLE):
- Do NOT explain repair steps
- Do NOT mention tools, equipment, temperatures, soldering, reflow, microscopes, IPC standards
- Do NOT give DIY advice or "what to try"
- Do NOT decode logs line by line
- Do NOT mention money, profit, ROI, revenue, or cost figures
- Do NOT use sales language (free quote, best, guaranteed)
- Do NOT add FAQs, tips, summaries, conclusions, or extra sections
- Do NOT add any content outside the defined structure

FINAL GOVERNING RULE:
If the article helps someone fix a miner, it is wrong.
If it helps someone decide to seek professional repair, it is correct.

ARTICLE CONTEXT:
Model: ${model}
Problem: ${problem}

LANGUAGE & TONE RULES:
- Simple English
- Calm, factual, authoritative
- Write for a non-technical miner owner
- No technical flexing

QUALITY RULES:
- Do NOT pad or repeat ideas
- Each paragraph must add a new angle, condition, or implication
- Prefer explanation depth over brevity`;

// --- 1. SEO ARCHITECT ---
async function runSeoArchitect(topic: string, articleType: ArticleType): Promise<{ outline: string; meta: { title: string; h1: string; metaDescription: string } }> {
    console.log("🏗️ [Architect] Generating SEO meta...");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
TOPIC: ${topic}

Generate SEO metadata for an ASIC repair article.

RULES:
- SEO Title format: [Model] [Problem] – ASIC Repair in India
- H1: Just the topic name
- Meta Description: max 160 characters, describe the problem and repair need (no sales language)

OUTPUT FORMAT (JSON only):
{
    "title": "...",
    "h1": "...",
    "metaDescription": "..."
}
`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_completion_tokens: 256,
        });

        const rawContent = completion.choices[0]?.message?.content || "";
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                outline: SECTION_DEFINITIONS[articleType].map(s => `## ${s.h2}`).join('\n'),
                meta: {
                    title: parsed.title || `${topic} – ASIC Repair in India`,
                    h1: parsed.h1 || topic,
                    metaDescription: parsed.metaDescription || `Understanding ${topic}: symptoms, causes, and when professional repair is required.`,
                },
            };
        }

        return {
            outline: SECTION_DEFINITIONS[articleType].map(s => `## ${s.h2}`).join('\n'),
            meta: {
                title: `${topic} – ASIC Repair in India`,
                h1: topic,
                metaDescription: `Understanding ${topic}: symptoms, causes, and when professional repair is required.`,
            },
        };
    } catch (e: any) {
        console.error("Architect failed:", e);
        return {
            outline: SECTION_DEFINITIONS[articleType].map(s => `## ${s.h2}`).join('\n'),
            meta: {
                title: `${topic} – ASIC Repair in India`,
                h1: topic,
                metaDescription: `Understanding ${topic}: symptoms, causes, and when professional repair is required.`,
            },
        };
    }
}

// --- 2. SECTION WRITER (DEPTH-FIRST with minimum word enforcement) ---
async function generateSection(
    sectionDef: SectionDefinition,
    topic: string,
    researchContext: string,
    articleType: ArticleType,
    useFallback: boolean = false
): Promise<string> {
    console.log(`✍️ [Writer] Generating Section ${sectionDef.id}: ${sectionDef.name} (min ${sectionDef.minWords} words)...`);

    // CTA section - return exact line
    if (sectionDef.name === 'cta') {
        return 'Chat with our ASIC repair team on WhatsApp to check repair feasibility.';
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const truncatedContext = researchContext.substring(0, 4000);

    // Extract model and problem from topic for system prompt
    const parts = topic.split(' ');
    const model = parts.slice(0, 3).join(' '); // e.g., "Antminer S21 Pro"
    const problem = parts.slice(3).join(' '); // e.g., "Hashboard Not Detected"

    const prompt = `
${getSystemPrompt(model, problem)}

SECTION TO WRITE: ${sectionDef.h2}
SECTION FOCUS: ${sectionDef.promptFocus}

RESEARCH CONTEXT:
${truncatedContext}

WORD COUNT REQUIREMENT (MANDATORY):
- This section MUST have at least ${sectionDef.minWords} words
- Aim for ${Math.round(sectionDef.minWords * 1.2)} words for depth
- Do NOT pad or repeat ideas - add new angles and implications
- Each paragraph should add value

TASK:
Write ONLY the content for this section: "${sectionDef.h2}"
Return ONLY the section content (no heading, no introduction, no conclusion).
`;

    try {
        const model = useFallback ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
        // Increase max tokens to accommodate longer sections
        const maxTokens = Math.max(400, Math.round(sectionDef.minWords * 1.8));

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: model,
            temperature: 0.6,
            max_completion_tokens: maxTokens,
        });

        const content = completion.choices[0]?.message?.content?.trim() || "";

        // Log word count for verification
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        console.log(`   ↳ Generated ${wordCount} words (min: ${sectionDef.minWords})`);

        return content;
    } catch (e: any) {
        console.error(`Section ${sectionDef.id} generation failed:`, e);
        if (!useFallback) {
            console.log("⚠️ Retrying with Llama 3.1 8b fallback...");
            return generateSection(sectionDef, topic, researchContext, articleType, true);
        }
        throw new Error(`Section ${sectionDef.id} failed on both primary and fallback.`);
    }
}

// --- MAIN ORCHESTRATOR ---
export async function runCommittee(
    topic: string,
    researchContext: string,
    articleType: ArticleType = 'model_problem'
): Promise<CommitteeOutput> {
    console.log("🚀 [Committee] Starting Production Blog Brain v3.0 (DEPTH-FIRST)...");
    console.log(`📊 Target: ${WORD_TARGETS[articleType].target.min}-${WORD_TARGETS[articleType].target.max} words, Hard reject: ${WORD_TARGETS[articleType].hardReject}`);

    try {
        // 1. Get SEO meta
        const { outline, meta } = await runSeoArchitect(topic, articleType);

        // 2. Generate each section sequentially with minimum word enforcement
        const sectionDefs = SECTION_DEFINITIONS[articleType];
        const sections: string[] = [];

        for (const sectionDef of sectionDefs) {
            const sectionContent = await generateSection(sectionDef, topic, researchContext, articleType);
            sections.push(sectionContent);
        }

        // 3. Assemble final article
        const finalArticle = `# ${meta.h1}\n\n` +
            sectionDefs.map((def, idx) => {
                // For CTA, don't add heading - just the line
                if (def.name === 'cta') {
                    return sections[idx];
                }
                return `## ${def.h2}\n\n${sections[idx]}`;
            }).join('\n\n');

        // 4. Validate total word count
        const validation = validateWordCount(finalArticle, articleType);
        console.log(`📏 Final word count: ${validation.count} (target: ${validation.target}, hard reject: ${validation.hardReject})`);

        if (!validation.valid) {
            console.warn(`⚠️ WARNING: Article below hard reject threshold (${validation.count} < ${validation.hardReject})`);
        }

        return {
            seoOutline: outline,
            seoMeta: meta,
            sections: sections,
            finalArticle: finalArticle,
        };

    } catch (e: any) {
        console.error("Committee Critical Failure:", e);
        return {
            seoOutline: "",
            seoMeta: { title: "", h1: "", metaDescription: "" },
            sections: [],
            finalArticle: "",
            error: e.message,
        };
    }
}

// --- LEGACY WRAPPER ---
export async function runCommitteeLegacy(topic: string, researchContext: string): Promise<{
    seoOutline: string;
    verificationNotes: string;
    finalArticle: string;
    error?: string;
}> {
    const result = await runCommittee(topic, researchContext, 'model_problem');
    return {
        seoOutline: result.seoOutline,
        verificationNotes: "Production Blog Brain v3.0 (DEPTH-FIRST) - Anti-DIY Enforced",
        finalArticle: result.finalArticle,
        error: result.error,
    };
}
