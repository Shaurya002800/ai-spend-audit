"use client";

import { useState } from "react";
import { TrendingDown, Shield, Zap, BarChart3 } from "lucide-react";
import SpendForm from "@/components/SpendForm";
import AuditResults from "@/components/AuditResults";
import { AuditInput, AuditResult } from "@/lib/audit-engine";

interface AuditResponse {
  result: AuditResult;
  aiSummary: string;
  shareId: string;
}

export default function HomePage() {
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const handleFormSubmit = async (input: AuditInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, _hp: "" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }
      const data = await res.json();
      setAuditData(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureLead = async (email: string, company: string, role: string) => {
    if (!auditData) return;
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId: auditData.shareId,
          email, companyName: company, role,
          monthlySavings: auditData.result.totalMonthlySavings,
          _hp: "",
        }),
      });
      setLeadCaptured(true);
    } catch (e) {
      console.error("Lead capture error:", e);
    }
  };

  const handleRunAgain = () => {
    setAuditData(null);
    setLeadCaptured(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-800 text-slate-800 text-lg">SpendLens</span>
            <span className="text-xs text-slate-400 font-500 hidden sm:block">by Credex</span>
          </div>
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-emerald-600 transition-colors font-500">
            credex.rocks ↗
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {!auditData ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 text-sm text-emerald-700 font-500 mb-6">
                <Zap className="w-3.5 h-3.5" />
                Free · No login required · 2 minutes
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4 leading-tight">
                Are you overpaying for<br />
                <span className="gradient-text">AI tools?</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                Most startups waste 30–50% of their AI budget on wrong plans, redundant tools,
                or retail pricing. Find out in 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              {[
                { icon: BarChart3, label: "8 tools audited", sub: "Cursor to Gemini" },
                { icon: Shield, label: "No login needed", sub: "100% private" },
                { icon: TrendingDown, label: "Avg. $340/mo saved", sub: "Per team audited" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
                  <Icon className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                  <div className="font-display font-700 text-slate-800 text-sm">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <SpendForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <p className="text-center text-xs text-slate-400 mt-8">
              Pricing data sourced from official vendor pages, verified May 2026.{" "}
              <a href="https://credex.rocks" className="text-emerald-600 hover:underline">SpendLens</a> is a free tool by Credex.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-800 text-slate-900">Your Audit Results</h2>
              <button onClick={handleRunAgain}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors font-500">
                ← Run another audit
              </button>
            </div>
            <AuditResults
              result={auditData.result}
              aiSummary={auditData.aiSummary}
              shareId={auditData.shareId}
              onCaptureLead={handleCaptureLead}
              leadCaptured={leadCaptured}
            />
          </div>
        )}
      </main>
    </div>
  );
}
