'use client';

import { useState } from 'react';

// Types
type Page = 'dashboard' | 'articles' | 'generate' | 'research' | 'tree';
type Status = 'ready' | 'draft' | 'pending';

interface Article {
  id: number;
  title: string;
  brand: string;
  model: string;
  status: Status;
  words: number;
}

// Sample data
const sampleArticles: Article[] = [
  { id: 1, title: 'S19 Pro Hashboard Not Detected', brand: 'Antminer', model: 'S19 Pro', status: 'ready', words: 2100 },
  { id: 2, title: 'M30S Overheating Issues', brand: 'WhatsMiner', model: 'M30S', status: 'draft', words: 1800 },
  { id: 3, title: 'S21 Low Hashrate Fix', brand: 'Antminer', model: 'S21', status: 'pending', words: 0 },
];

// Miner data for prompt generation
const minerData: Record<string, Record<string, { chips: string; power: string; ambient: string }>> = {
  'Antminer': {
    'S19 Pro': { chips: 'BM1397AG (7nm)', power: '3250W', ambient: '40°C' },
    'S19 XP': { chips: 'BM1397AH (5nm)', power: '3010W', ambient: '40°C' },
    'S21': { chips: 'BM1397AH (3nm)', power: '3500W', ambient: '47°C' },
    'L7': { chips: 'BM1485 (Scrypt)', power: '3425W', ambient: '35°C' },
  },
  'WhatsMiner': {
    'M30S': { chips: 'Samsung 8nm', power: '3268W', ambient: '40°C' },
    'M50': { chips: 'Samsung 5nm', power: '3536W', ambient: '45°C' },
  },
  'Avalon': {
    '1246': { chips: 'A3206 (16nm)', power: '3420W', ambient: '40°C' },
  },
};

export default function Home() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [selectedBrand, setSelectedBrand] = useState('Antminer');
  const [selectedModel, setSelectedModel] = useState('S19 Pro');
  const [selectedType, setSelectedType] = useState('hashboard-not-detected');
  const [claudeResponse, setClaudeResponse] = useState('');

  const models = Object.keys(minerData[selectedBrand] || {});
  const specs = minerData[selectedBrand]?.[selectedModel] || { chips: '', power: '', ambient: '' };

  const generatePrompt = () => {
    const typeLabels: Record<string, string> = {
      'hashboard-not-detected': 'Hashboard Not Detected - Troubleshooting Guide',
      'overheating': 'Overheating Issues - Prevention & Solutions',
      'low-hashrate': 'Low Hashrate - Diagnosis & Fixes',
    };

    return `You are an expert ASIC repair technician and technical writer for ASICREPAIR.IN, India's premier ASIC miner repair service.

Write a comprehensive 2000-word article about:
"${selectedBrand} ${selectedModel} ${typeLabels[selectedType]}"

## Technical Data to Use:
- Model: ${selectedBrand} ${selectedModel}
- Chips: ${specs.chips}
- Power: ${specs.power} at wall
- Ambient limit: ${specs.ambient} (CRITICAL for India)
- Common failures: VRM 15%, chip 20%, connector 35%

## Article Requirements:
1. Start with problem introduction
2. List common causes with explanations
3. Provide step-by-step troubleshooting
4. Include when to seek professional help
5. End with ASICREPAIR.IN contact CTA

## Target Audience:
Indian mining farm operators and home miners

## Tone:
Professional, helpful, technically accurate`;
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(generatePrompt());
    alert('Prompt copied! Paste in Claude.ai');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">⚡ ASICREPAIR ADMIN</div>
        <nav className="nav-menu">
          <button className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            <span className="nav-icon">🏠</span> Dashboard
          </button>
          <button className={`nav-item ${activePage === 'articles' ? 'active' : ''}`} onClick={() => setActivePage('articles')}>
            <span className="nav-icon">📝</span> Articles
          </button>
          <button className={`nav-item ${activePage === 'generate' ? 'active' : ''}`} onClick={() => setActivePage('generate')}>
            <span className="nav-icon">✨</span> Generate
          </button>
          <button className={`nav-item ${activePage === 'research' ? 'active' : ''}`} onClick={() => setActivePage('research')}>
            <span className="nav-icon">🔬</span> Research
          </button>
          <button className={`nav-item ${activePage === 'tree' ? 'active' : ''}`} onClick={() => setActivePage('tree')}>
            <span className="nav-icon">🌳</span> Blog Tree
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard */}
        {activePage === 'dashboard' && (
          <>
            <div className="page-header">
              <h1 className="page-title">🏠 Dashboard</h1>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">18</div>
                <div className="stat-label">Articles Created</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">62</div>
                <div className="stat-label">Pending Topics</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Ready to Publish</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Published</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📊 Coverage by Brand</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Antminer</span>
                    <span>60% (24/40)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '60%' }}></div></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>WhatsMiner</span>
                    <span>35% (7/20)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '35%' }}></div></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Avalon</span>
                    <span>40% (2/5)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '40%' }}></div></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🚀 Quick Actions</h3>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => setActivePage('generate')}>🆕 Generate Article</button>
                <button className="btn btn-secondary" onClick={() => setActivePage('articles')}>📋 View Pending</button>
                <button className="btn btn-secondary" onClick={() => setActivePage('research')}>📥 Import Data</button>
              </div>
            </div>
          </>
        )}

        {/* Articles */}
        {activePage === 'articles' && (
          <>
            <div className="page-header">
              <h1 className="page-title">📝 Articles</h1>
              <button className="btn btn-primary">+ New Article</button>
            </div>

            <div className="card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Brand</th>
                    <th>Status</th>
                    <th>Words</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleArticles.map(article => (
                    <tr key={article.id}>
                      <td>{article.title}</td>
                      <td>{article.brand}</td>
                      <td><span className={`status-badge ${article.status}`}>{article.status}</span></td>
                      <td>{article.words || '-'}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Generate */}
        {activePage === 'generate' && (
          <>
            <div className="page-header">
              <h1 className="page-title">✨ Generate Article</h1>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Step 1: Select Topic</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Article Type</label>
                  <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="hashboard-not-detected">Hashboard Not Detected</option>
                    <option value="overheating">Overheating Issues</option>
                    <option value="low-hashrate">Low Hashrate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <select className="form-select" value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(Object.keys(minerData[e.target.value])[0]); }}>
                    {Object.keys(minerData).map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <select className="form-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                    {models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Step 2: Attached Research Data</h3>
              <div className="research-list">
                <div className="research-item">
                  <span>✅</span>
                  <div>
                    <strong>Technical Specifications</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{specs.chips}, {specs.power}</div>
                  </div>
                </div>
                <div className="research-item">
                  <span>✅</span>
                  <div>
                    <strong>Failure Patterns</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>VRM 15%, chip 20%, connector 35%</div>
                  </div>
                </div>
                <div className="research-item">
                  <span>✅</span>
                  <div>
                    <strong>India Context</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Repair costs ₹15,000-45,000</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Step 3: Your Prompt (Ready for Claude!)</h3>
              <div className="prompt-area">{generatePrompt()}</div>
              <div className="prompt-actions">
                <button className="btn btn-primary" onClick={copyPrompt}>📋 Copy Prompt</button>
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">🔗 Open Claude.ai</a>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Step 4: Paste Claude&apos;s Response</h3>
              <textarea
                className="form-textarea"
                style={{ width: '100%', minHeight: '200px' }}
                placeholder="Paste Claude's generated article here..."
                value={claudeResponse}
                onChange={(e) => setClaudeResponse(e.target.value)}
              />
              <div className="prompt-actions">
                <button className="btn btn-secondary">💾 Save as Draft</button>
                <button className="btn btn-primary">✅ Save as Ready</button>
              </div>
            </div>
          </>
        )}

        {/* Research */}
        {activePage === 'research' && (
          <>
            <div className="page-header">
              <h1 className="page-title">🔬 Research Data</h1>
              <button className="btn btn-primary">📥 Import Data</button>
            </div>

            <div className="card">
              <div className="file-browser">
                <div className="file-tree">
                  <div className="folder">
                    <span className="folder-name">▼ Knowledge Base</span>
                    <div className="file-item active">📄 ASIC_FAILURE_KNOWLEDGE_BASE.md</div>
                    <div className="file-item">📄 brands_data.json</div>
                    <div className="file-item">📄 india_context.md</div>
                  </div>
                  <div className="folder">
                    <span className="folder-name">▶ Raw Data</span>
                  </div>
                  <div className="folder">
                    <span className="folder-name">▶ Model Specs</span>
                  </div>
                </div>
                <div className="file-content">
                  {`# ASIC Failure Knowledge Base

## Antminer S19 Series

### Common Failure Patterns
- VRM failures: 15-20%
- Chip degradation: 10-15%
- Connector issues: 25-35%

### India-Specific Data
- Summer failures: +40% increase
- Repair cost: ₹15,000-45,000
- Power fluctuation damage common`}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Blog Tree */}
        {activePage === 'tree' && (
          <>
            <div className="page-header">
              <h1 className="page-title">🌳 Blog Tree - Content Roadmap</h1>
              <button className="btn btn-primary" onClick={() => setActivePage('generate')}>⚡ Generate Next Priority</button>
            </div>

            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Phase 1 Progress</span>
                <span>18/80 articles (23%)</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '23%' }}></div></div>
            </div>

            <div className="card">
              <div className="tree-node phase">
                <div className="node-header">
                  <span>▼</span>
                  <span>📂</span>
                  <strong>PHASE 1: Model-Specific Articles</strong>
                  <span className="node-progress">18/80</span>
                </div>

                <div className="tree-node">
                  <div className="node-header">
                    <span>▼</span>
                    <span>🔴</span>
                    <span>Hashboard Not Detected</span>
                    <span className="node-progress">12/40</span>
                  </div>

                  <div className="tree-node">
                    <div className="node-header">
                      <span>▶</span>
                      <span>⚡</span>
                      <span>Antminer</span>
                      <span className="node-progress">8/20</span>
                    </div>
                  </div>
                  <div className="tree-node">
                    <div className="node-header">
                      <span>▶</span>
                      <span>⚡</span>
                      <span>WhatsMiner</span>
                      <span className="node-progress">3/15</span>
                    </div>
                  </div>
                  <div className="tree-node">
                    <div className="node-header">
                      <span>▶</span>
                      <span>⚡</span>
                      <span>Avalon</span>
                      <span className="node-progress">1/5</span>
                    </div>
                  </div>
                </div>

                <div className="tree-node">
                  <div className="node-header">
                    <span>▶</span>
                    <span>🟡</span>
                    <span>Overheating Issues</span>
                    <span className="node-progress">4/40</span>
                  </div>
                </div>

                <div className="tree-node">
                  <div className="node-header">
                    <span>▶</span>
                    <span>🟠</span>
                    <span>Low Hashrate</span>
                    <span className="node-progress">2/40</span>
                  </div>
                </div>
              </div>

              <div className="tree-node phase">
                <div className="node-header">
                  <span>▶</span>
                  <span>📂</span>
                  <strong>PHASE 2: Repair Insights</strong>
                  <span className="node-progress">0/30</span>
                </div>
              </div>

              <div className="tree-node phase">
                <div className="node-header">
                  <span>▶</span>
                  <span>📂</span>
                  <strong>PHASE 3: Seasonal Content</strong>
                  <span className="node-progress">0/20</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', gap: '24px' }}>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', marginRight: '6px' }}></span> Ready</span>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)', marginRight: '6px' }}></span> Draft</span>
                <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-muted)', marginRight: '6px' }}></span> Pending</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
