'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        }
    };

    const menuItems = [
        { href: '/dashboard', icon: '🏠', label: 'Dashboard', exact: true },
        { href: '/dashboard/tree', icon: '🌳', label: 'Blog Tree' },
        { href: '/dashboard/research', icon: '🔬', label: 'Research' },
        { href: '/dashboard/generate', icon: '✨', label: 'Writer Studio' },
        { href: '/dashboard/claude', icon: '📋', label: 'Final Output' },
        { href: '/dashboard/seo-links', icon: '🔗', label: 'SEO Links' },

        { href: '/dashboard/articles', icon: '📝', label: 'Articles' },
        { href: '/dashboard/publish', icon: '🚀', label: 'Publish Hub' },
        { href: '/dashboard/keywords', icon: '🔑', label: 'Keywords' },
    ];

    const isActive = (item: typeof menuItems[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <div className="app-container">
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    className="bg-slate-800 text-white p-2 rounded shadow-lg"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="brand-section">
                    <span>⚡ ASIC ADMIN</span>
                </div>
                <nav className="nav-menu">
                    {menuItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive(item) ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 p-2 rounded transition-colors"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>
                </div>

                <div className="p-4 border-t border-slate-700">
                    <div className="text-xs text-slate-400 mb-2">System Status</div>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Online v2.2 (Secured)
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
