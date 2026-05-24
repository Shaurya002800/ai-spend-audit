import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit for Startups",
  description: "Find out if you're overpaying for AI tools. Get an instant audit of your Cursor, Claude, ChatGPT, Copilot stack. Free, no login required.",
  metadataBase: new URL("https://ai-spend-audit.vercel.app"),
  openGraph: {
    title: "SpendLens — Free AI Spend Audit",
    description: "Most startups overpay for AI tools by 30–50%. Find out where in 2 minutes.",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit",
    description: "Most startups overpay for AI tools by 30–50%. Find out where in 2 minutes.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
