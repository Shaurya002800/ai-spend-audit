import { Metadata } from "next";
import { notFound } from "next/navigation";
import SharedAuditClient from "./SharedAuditClient";

interface PageProps {
  params: { shareId: string };
}

async function getAuditData(shareId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/share/${shareId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getAuditData(params.shareId);
  if (!data) {
    return { title: "Audit not found — SpendLens" };
  }

  const savings = data.auditResult?.totalMonthlySavings || 0;
  const current = data.auditResult?.totalCurrentSpend || 0;

  return {
    title: `AI Spend Audit — ${Math.round(savings > 0 ? (savings / current) * 100 : 0)}% potential savings — SpendLens`,
    description: `This team is spending $${Math.round(current)}/mo on AI tools and could save $${Math.round(savings)}/mo. See their full audit on SpendLens.`,
    openGraph: {
      title: `AI Spend Audit — $${Math.round(savings)}/mo savings identified`,
      description: `Spending $${Math.round(current)}/mo → could spend $${Math.round(current - savings)}/mo. Run your own free audit at SpendLens.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit — $${Math.round(savings)}/mo savings identified`,
      description: `Spending $${Math.round(current)}/mo → could spend $${Math.round(current - savings)}/mo. Run your own free audit at SpendLens.`,
    },
  };
}

export default async function SharedAuditPage({ params }: PageProps) {
  const data = await getAuditData(params.shareId);
  if (!data) notFound();

  return <SharedAuditClient data={data} shareId={params.shareId} />;
}
