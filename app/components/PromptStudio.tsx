'use client';
import { useState } from 'react';

// Enhanced Types
type PromptTemplate = 'troubleshooting' | 'setup-guide' | 'comparison' | 'maintenance' | 'technical-deep-dive';
type Tone = 'expert' | 'friendly' | 'tutorial' | 'analytical';

interface PromptConfig {
    template: PromptTemplate;
    tone: Tone;
    wordCount: number;
    includeIndiaContext: boolean;
    includeCostEstimates: boolean;
}

// Brand Data with Categories
const brandData = {
    'Antminer': {
        models: ['S19 Pro', 'S19 XP', 'S21', 'L7', 'K7', 'D9', 'T21'],
        failures: ['Hashboard Not Detected', 'Low Hashrate', 'Chain Break', 'Zero ASIC', 'High Temp']
    },
    'WhatsMiner': {
        models: ['M30S', 'M30S+', 'M50', 'M50S', 'M60'],
        failures: ['Error 201', 'Error 530', 'Fan Error', 'PSU Failure']
    },
    'Avalon': {
        models: ['1246', '1346', '1366'],
        failures: ['Communication Error', 'CRC Error', 'Temp Sensor Fail']
    }
};

export default function PromptStudio() {
    const [config, setConfig] = useState<PromptConfig>({
        template: 'troubleshooting',
        tone: 'expert',
        wordCount: 2000,
        includeIndiaContext: true,
        includeCostEstimates: true
    });

    const [selectedBrand, setSelectedBrand] = useState('Antminer');
    const [selectedModel, setSelectedModel] = useState('S19 Pro');
    const [selectedTopic, setSelectedTopic] = useState('Hashboard Not Detected');
    const [batchMode, setBatchMode] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    // Prompt Templates
    const templates: Record<PromptTemplate, { title: string, structure: string }> = {
        'troubleshooting': {
            title: '🔧 Repair Guide',
            structure: '1. Diagnosis 2. Tools Needed 3. Step-by-Step Fix 4. Verification'
        },
        'setup-guide': {
            title: '📦 Setup & Install',
            structure: '1. Unboxing 2. Wiring 3. Network Config 4. First Boot'
        },
        'comparison': {
            title: '⚖️ Product Comparison',
            structure: '1. Specs Comparison 2. Profitability 3. ROI Analysis 4. Verdict'
        },
        'maintenance': {
            title: '🧹 Maintenance',
            structure: '1. Cleaning 2. Periodic Checks 3. Environment 4. Lifespan'
        },
        'technical-deep-dive': {
            title: '🔬 Technical Deep Dive',
            structure: '1. Architecture 2. Chip Analysis 3. Power Path 4. Schematics'
        }
    };

    const generatePrompt = () => {
        const prompt = `You are an ${config.tone} ASIC Repair Engineer writing for ASICREPAIR.IN.

TASK: Write a ${config.wordCount}-word ${templates[config.template].title} about:
"${selectedBrand} ${selectedModel} - ${selectedTopic}"

CONTEXT:
- Target Audience: Indian mining farm operators
- Location: India (Consider heat, humidity, dust, power fluctuation)
- Component focus: ${selectedModel} specific components
${config.includeIndiaContext ? '- INCLUDE: India specific challenges (monsoon, ambient temp >40C)' : ''}
${config.includeCostEstimates ? '- INCLUDE: Repair cost estimates in INR' : ''}

STRUCTURE:
${templates[config.template].structure}

TECHNICAL REQUIREMENTS:
- Use technical terminology correctly (LDO, PIC, EEPROM, buck controller)
- Mention specific tools (Fluke multimeter, Hikmicro thermal cam)
- Reference specific chips/voltages for ${selectedModel}
- End with CTA for ASICREPAIR.IN services

TONE: ${config.tone.toUpperCase()} - authoritative but accessible.`;

        setGeneratedPrompt(prompt);
    };

    return (
        <div className="card">
            <div className="page-header" style={{ marginBottom: '16px' }}>
                <h2 className="card-title">✨ AI Prompt Studio</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn ${batchMode ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setBatchMode(!batchMode)}
                    >
                        {batchMode ? '📚 Batch Mode: ON' : '⚡ Single Mode'}
                    </button>
                </div>
            </div>

            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <div className="form-group">
                    <label className="form-label">Template</label>
                    <select
                        className="form-select"
                        value={config.template}
                        onChange={(e) => setConfig({ ...config, template: e.target.value as PromptTemplate })}
                    >
                        {Object.entries(templates).map(([key, val]) => (
                            <option key={key} value={key}>{val.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Tone</label>
                    <select
                        className="form-select"
                        value={config.tone}
                        onChange={(e) => setConfig({ ...config, tone: e.target.value as Tone })}
                    >
                        <option value="expert">🎓 Expert (Technical)</option>
                        <option value="friendly">🤝 Friendly (Guide)</option>
                        <option value="tutorial">📹 Tutorial (Step-by-step)</option>
                        <option value="analytical">📊 Analytical (Data-heavy)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Word Count</label>
                    <input
                        type="number"
                        className="form-input"
                        value={config.wordCount}
                        onChange={(e) => setConfig({ ...config, wordCount: parseInt(e.target.value) })}
                        step={100}
                        min={500}
                    />
                </div>

                <div className="form-group">
                    <div style={{ paddingTop: '30px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={config.includeIndiaContext}
                                onChange={(e) => setConfig({ ...config, includeIndiaContext: e.target.checked })}
                            />
                            🇮🇳 India Context
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '16px 0' }}></div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Brand</label>
                    <select
                        className="form-select"
                        value={selectedBrand}
                        onChange={(e) => {
                            setSelectedBrand(e.target.value);
                            setSelectedModel(brandData[e.target.value as keyof typeof brandData].models[0]);
                        }}
                    >
                        {Object.keys(brandData).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Model</label>
                    <select
                        className="form-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                    >
                        {brandData[selectedBrand as keyof typeof brandData].models.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Topic / Failure</label>
                    <select
                        className="form-select"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                        {brandData[selectedBrand as keyof typeof brandData].failures.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={generatePrompt}>
                    🪄 Generate Prompt
                </button>
            </div>

            {generatedPrompt && (
                <div style={{ marginTop: '24px' }}>
                    <h3 className="card-title">Generated Prompt</h3>
                    <div className="prompt-area" style={{ marginTop: '8px' }}>
                        {generatedPrompt}
                    </div>
                    <div className="prompt-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                navigator.clipboard.writeText(generatedPrompt);
                                alert('Copied to clipboard!');
                            }}
                        >
                            📋 Copy for Claude
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
