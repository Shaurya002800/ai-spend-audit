"use client";

import Link from "next/link";
import { TrendingDown, ArrowRight, CheckCircle, XCircle, Sparkles, ExternalLink } from "lucide-react";
import { AuditResult, ToolRecommendation } from "@/lib/audit-engine";
import { cn, formatCurrency } from "@/lib/utils";

interface SharedData {
  auditInput: { teamSize: number; useCase: string; tools: { toolId: string; plan: string; monthlySpend: number; seats: number }[] };
  auditResult: AuditResult;
  aiSummary: string;
  createdAt: string;
  shareId: string;
}

const ACTION_COLORS = {
  keep: "text-emerald-600 bg-emerald-50",
  downgrade: "text-amber-600 bg-amber-50",
  switch: "text-blue-600 bg-blue-50",
  eliminate: "text-red-600 bg-red-50",
};

export default function SharedAuditClient({ data, shareId }: { data: SharedData; shareId: string }) {
  const { auditResult, aiSummary, auditInput, createdAt } = data;
  const date = new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-800 text-slate-800 text-lg">SpendLens</span>
          </Link>
          <Link
            href="/"
            className="text-xs bg-emerald-600 text-white font-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Run my own audit →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <p className="text-sm text-slate-400 mb-1">Shared AI Spend Audit · {date}</p>
          <h1 className="font-display text-3xl font-800 text-slate-900">
            {auditResult.isAlreadyOptimal
              ? "This team is spending well."
              : `${formatCurrency(auditResult.totalMonthlySavings)}/mo in savings identified`}
          </h1>
          <p className="text-slate-500 mt-2">
            Team of {auditInput.teamSize} · {auditInput.useCase} workflows ·{" "}
            {auditInput.tools.length} tools audited
          </p>
        </div>

        {/* Savings hero */}
        <div className={cn(
          "rounded-3xl p-7 text-white",
          auditResult.isAlreadyOptimal
            ? "bg-gradient-to-br from-slate-700 to-slate-900"
            : "bg-gradient-to-br from-emerald-600 to-emerald-800"
        )}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-white/60 text-xs mb-1">Current spend</div>
              <div className="font-display font-700 text-xl">{formatCurrency(auditResult.totalCurrentSpend)}/mo</div>
            </div>
            <div>
              <div className="text-white/60 text-xs mb-1">Optimized spend</div>
              <div className="font-display font-700 text-xl">{formatCurrency(auditResult.totalProjectedSpend)}/mo</div>
            </div>
            <div>
              <div className="text-white/60 text-xs mb-1">Annual savings</div>
              <div className="font-display font-700 text-xl">{formatCurrency(auditResult.totalAnnualSavings)}</div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-600 text-violet-600">AI-generated summary</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm">{aiSummary}</p>
        </div>

        {/* Recommendations */}
        <div>
          <h2 className="font-display font-700 text-lg text-slate-800 mb-3">Recommendations</h2>
          <div className="space-y-3">
            {auditResult.recommendations.map((rec: ToolRecommendation) => (
              <div key={rec.toolId} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display font-700 text-slate-800">{rec.toolName}</span>
                      <span className="text-xs text-slate-400">{rec.currentPlan}</span>
                      <span className={cn("text-xs font-600 px-2 py-0.5 rounded-full", ACTION_COLORS[rec.recommendedAction])}>
                        {rec.recommendedAction}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{rec.reason}</p>
                    {rec.recommendedPlan && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <ArrowRight className="w-3 h-3" />
                        Switch to: <span className="font-600 text-slate-600">{rec.recommendedPlan}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {rec.monthlySavings > 0 ? (
                      <span className="font-display font-700 text-emerald-600">
                        -{formatCurrency(rec.monthlySavings)}/mo
                      </span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credex CTA */}
        {auditResult.isHighSavings && (
          <div className="bg-emerald-600 rounded-2xl p-6 text-white">
            <h3 className="font-display font-700 text-lg mb-2">Credex can capture these savings</h3>
            <p className="text-emerald-100 text-sm mb-4">
              Credex sources discounted AI infrastructure credits at 20–30% off retail, from companies that overforecast.
              Zero code changes, same tools, lower bill.
            </p>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-600 px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors">
              Learn more at credex.rocks <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Run your own CTA */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
          <h3 className="font-display font-700 text-xl mb-2">Run your own free audit</h3>
          <p className="text-slate-400 text-sm mb-5">Takes 2 minutes. No login required.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-600 px-6 py-3 rounded-xl transition-colors"
          >
            Audit my AI stack →
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400">
          SpendLens · Free AI spend audit tool by Credex ·{" "}
          <a href={`/r/${shareId}`} className="text-emerald-600 hover:underline">
            spendlens.ai/r/{shareId}
          </a>
        </p>
      </main>
    </div>
  );
}
