'use client';

import { useState } from 'react';
import PromptStudio from './components/PromptStudio';
import ArticleEditor from './components/ArticleEditor';
import KeywordTracker from './components/KeywordTracker';
import ResearchViewer from './components/ResearchViewer';


// Types
type Page = 'dashboard' | 'articles' | 'generate' | 'research' | 'tree' | 'publish' | 'editor' | 'keywords';
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

export default function Home() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

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
          <button className={`nav-item ${activePage === 'keywords' ? 'active' : ''}`} onClick={() => setActivePage('keywords')}>
            <span className="nav-icon">🔑</span> Keywords
          </button>
          <div style={{ margin: '12px 0', borderTop: '1px solid var(--glass-border)' }}></div>
          <button className={`nav-item ${activePage === 'publish' ? 'active' : ''}`} onClick={() => setActivePage('publish')}>
            <span className="nav-icon">🚀</span> Publish Hub
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
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setActivePage('editor')}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Editor */}
        {activePage === 'editor' && (
          <ArticleEditor onBack={() => setActivePage('articles')} />
        )}

        {/* Generate */}
        {activePage === 'generate' && (
          <PromptStudio />
        )}

        {/* Research */}
        {activePage === 'research' && (
          <>
            <div className="page-header">
              <h1 className="page-title">🔬 Research Data</h1>
              <button className="btn btn-primary">📥 Import Data</button>
            </div>
            <ResearchViewer />
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

        {/* Keywords */}
        {activePage === 'keywords' && (
          <KeywordTracker />
        )}

        {/* Publish Hub */}
        {activePage === 'publish' && (
          <>
            <div className="page-header">
              <h1 className="page-title">🚀 Publish Hub</h1>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Ready to Publish (12)</h3>
                <button className="btn btn-primary">Publish All</button>
              </div>
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select articles to export or publish to your website.
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
