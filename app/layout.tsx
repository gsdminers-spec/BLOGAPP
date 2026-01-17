import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASICREPAIR.IN - Blog Admin",
  description: "Blog Administration System for ASICREPAIR.IN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
