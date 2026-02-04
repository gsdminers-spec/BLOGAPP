'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { marked } from 'marked';

interface LinkStudioProps {
    articleContent: string;
    onUpdate: (newContent: string) => void;
    onSave: () => void;
}

export default function LinkStudio({ articleContent, onUpdate, onSave }: LinkStudioProps) {
    const [status, setStatus] = useState<string>('');
    const [selectedCta, setSelectedCta] = useState<string | null>(null);

    const applySmartLinks = async () => {
        setStatus('Fetching keywords...');
        const { data: keywords } = await supabase.from('seo_keywords').select('*');

        if (!keywords || keywords.length === 0) {
            alert('No keywords found in database. Add some in the SEO Links tab first!');
            setStatus('');
            return;
        }

        let newContent = articleContent;
        let count = 0;

        keywords.forEach(k => {
            // Regex to match exact phrase, case insensitive, not already in a link
            // This is a basic implementation. For production robust regex is cleaner.
            const regex = new RegExp(`(?<!\\[|\\()\\b${k.phrase}\\b(?![^\\[]*\\]|[^\\(]*\\))`, 'i');
            if (regex.test(newContent)) {
                // Ensure we only replace the FIRST instance to avoid spamming
                const match = newContent.match(regex);
                if (match) {
                    newContent = newContent.replace(regex, `[${match[0]}](${k.url})`);
                    count++;
                }
            }
        });

        onUpdate(newContent);
        setStatus(`Applied ${count} smart links! ✅`);
        setTimeout(() => setStatus(''), 3000);
    };

    const injectCta = (type: string) => {
        let ctaBlock = '';

        if (type === 'whatsapp') {
            ctaBlock = `\n\n> **Need Professional Help?**  \n> [Chat with us on WhatsApp](https://wa.me/918208752205) for instant repair quotes. 🛠️\n\n`;
        } else if (type === 'parts') {
            ctaBlock = `\n\n> **Looking for Spare Parts?**  \n> Check out our official [Spare Parts Store](/parts) for genuine ASIC components. 🛒\n\n`;
        } else if (type === 'course') {
            ctaBlock = `\n\n> **Want to Learn Repair?**  \n> Join our [Masterclass Training](/training) and become a certified technician. 🎓\n\n`;
        }

        // Inject after intro (approx 1st paragraph or heading)
        // Simple logic: Append to end for now, user can move it. 
        // Or specific logic: After first H2.

        onUpdate(articleContent + ctaBlock);
        setSelectedCta(type);
        setStatus(`Injected ${type} CTA! 🚀`);
    };

    return (
        <div className="card bg-indigo-50 border-indigo-200">
            <h3 className="card-title text-indigo-900 mb-4">🔗 Link & CTA Studio</h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Manual Links */}
                <div>
                    <h4 className="font-semibold text-sm mb-2 text-indigo-800">1. Smart Internal Links</h4>
                    <p className="text-xs text-indigo-600 mb-3">
                        Auto-detects keywords from your database and links them.
                    </p>
                    <button
                        className="btn btn-secondary w-full bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={applySmartLinks}
                    >
                        ✨ Apply Smart Links
                    </button>
                    {status && <div className="mt-2 text-xs font-bold text-green-600 animate-pulse">{status}</div>}
                </div>

                {/* CTA Selector */}
                <div>
                    <h4 className="font-semibold text-sm mb-2 text-indigo-800">2. Inject CTA (Select One)</h4>
                    <div className="space-y-2">
                        <button
                            className={`w-full text-left p-2 rounded text-xs border transition-all ${selectedCta === 'whatsapp' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                            onClick={() => injectCta('whatsapp')}
                        >
                            💬 <strong>WhatsApp Contact</strong> (Service Focus)
                        </button>
                        <button
                            className={`w-full text-left p-2 rounded text-xs border transition-all ${selectedCta === 'parts' ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                            onClick={() => injectCta('parts')}
                        >
                            🛒 <strong>Spare Parts</strong> (Sales Focus)
                        </button>
                        <button
                            className={`w-full text-left p-2 rounded text-xs border transition-all ${selectedCta === 'course' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                            onClick={() => injectCta('course')}
                        >
                            🎓 <strong>Training Course</strong> (Edu Focus)
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-200 flex justify-end">
                <button
                    className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={onSave}
                >
                    💾 Save Final Version
                </button>
            </div>
        </div>
    );
}
