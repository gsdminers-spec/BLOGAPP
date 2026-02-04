
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ASICREPAIR.IN Blog Admin',
    description: 'Internal content generation system',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
