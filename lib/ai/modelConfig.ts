export const AI_CONFIG = {
    // --- GOOGLE GEMINI (The Workhorse) ---
    // Usage: Research, Architect, Verifier, Writer
    // Limits: 5 RPM / 1M TPM
    GEMINI: {
        API_KEY_ENV: 'GEMINI_API_KEY',
        MODEL_PERFORMANCE: 'gemini-2.5-flash',
    },

    // --- DEPRECATED / BACKUP ---
    OPENROUTER: {
        API_KEY_ENV: 'OPENROUTER_API_KEY',
        MODEL_VERIFIER: 'tngtech/deepseek-r1t2-chimera:free',
    }
};

export const AGENT_ROLES = {
    RESEARCHER: AI_CONFIG.GEMINI.MODEL_PERFORMANCE,
    ARCHITECT: AI_CONFIG.GEMINI.MODEL_PERFORMANCE,
    VERIFIER: AI_CONFIG.GEMINI.MODEL_PERFORMANCE, // CONSOLIDATED: All roles on Gemini 2.5
    WRITER: AI_CONFIG.GEMINI.MODEL_PERFORMANCE,
};
