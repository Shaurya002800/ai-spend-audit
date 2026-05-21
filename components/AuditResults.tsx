"use client";

import { useState } from "react";
import {
  TrendingDown, ArrowRight, CheckCircle, AlertCircle,
  XCircle, Share2, Mail, Copy, ExternalLink, Sparkles, ChevronDown
} from "lucide-react";
import { AuditResult, ToolRecommendation } from "@/lib/audit-engine";
import { cn, formatCurrency } from "@/lib/utils";

interface AuditResultsProps {
  result: AuditResult;
  aiSummary: string;
  shareId: string;
  onCaptureLead: (email: string, company: string, role: string) => Promise<void>;
  leadCaptured: boolean;
}

const ACTION_CONFIG = {
  keep: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Optimized" },
  downgrade: { icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Downgrade" },
  switch: { icon: ArrowRight, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Switch" },
  eliminate: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Eliminate" },
};

export default function AuditResults({
  result, aiSummary, shareId, onCaptureLead, leadCaptured,
}: AuditResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const shareUrl = `${window.location.origin}/r/${shareId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onCaptureLead(email, company, role);
    setSubmitting(false);
    setShowLeadForm(false);
  };

  const savingsPercent = result.totalCurrentSpend > 0
    ? Math.round((result.totalMonthlySavings / result.totalCurrentSpend) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Hero savings card */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-8 text-white",
        result.isAlreadyOptimal
          ? "bg-gradient-to-br from-slate-700 to-slate-900"
          : "bg-gradient-to-br from-emerald-600 to-emerald-800"
      )}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />

        <div className="relative">
          {result.isAlreadyOptimal ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-600 uppercase tracking-wider">Already optimized</span>
              </div>
              <h2 className="font-display text-4xl font-800 mb-2">You&apos;re spending well.</h2>
              <p className="text-slate-300 text-lg">
                Less than {formatCurrency(100)}/mo in identified savings — your stack is efficient.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-emerald-300" />
                <span className="text-emerald-300 text-sm font-600 uppercase tracking-wider">Overspend detected</span>
              </div>
              <div className="flex items-end gap-3 mb-1 animate-count-up">
                <span className="font-display text-6xl font-800 leading-none">
                  {formatCurrency(result.totalMonthlySavings)}
                </span>
                <span className="text-emerald-200 text-xl mb-2">/month</span>
              </div>
              <p className="text-emerald-100 text-lg mb-4">
                {formatCurrency(result.totalAnnualSavings)}/year · {savingsPercent}% of your current AI spend
              </p>
            </>
          )}

          <div className="flex gap-3 flex-wrap mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="text-xs text-white/60 mb-0.5">Current spend</div>
              <div className="font-display font-700 text-lg">{formatCurrency(result.totalCurrentSpend)}/mo</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="text-xs text-white/60 mb-0.5">Optimized spend</div>
              <div className="font-display font-700 text-lg">{formatCurrency(result.totalProjectedSpend)}/mo</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="text-xs text-white/60 mb-0.5">Annual savings</div>
              <div className="font-display font-700 text-lg">{formatCurrency(result.totalAnnualSavings)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-600 text-violet-600">AI-generated summary</span>
        </div>
        <p className="text-slate-700 leading-relaxed">{aiSummary}</p>
      </div>

      {/* Per-tool breakdown */}
      <div>
        <h3 className="font-display text-xl font-700 text-slate-800 mb-3">Per-tool breakdown</h3>
        <div className="space-y-3 stagger">
          {result.recommendations.map((rec) => (
            <RecommendationCard key={rec.toolId} rec={rec} />
          ))}
        </div>
      </div>

      {/* Credex CTA (high savings) */}
      {result.isHighSavings && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-700 text-xl mb-1">
                You qualify for Credex credits
              </h3>
              <p className="text-emerald-100 text-sm mb-4">
                At {formatCurrency(result.totalMonthlySavings)}/mo in savings, you&apos;re exactly who Credex was built for.
                We source discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise — from companies that overforecast.
                The discount is real and the setup is zero-effort.
              </p>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-600 px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
              >
                Book a Credex consultation <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Already optimal CTA */}
      {result.isAlreadyOptimal && !leadCaptured && (
        <div className="bg-slate-800 rounded-2xl p-6 text-white">
          <h3 className="font-display font-700 text-lg mb-1">Stay ahead of new optimizations</h3>
          <p className="text-slate-400 text-sm mb-4">
            AI tool pricing changes constantly. We&apos;ll notify you when new savings opportunities apply to your stack.
          </p>
          {!showLeadForm ? (
            <button
              onClick={() => setShowLeadForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-600 px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Notify me
            </button>
          ) : (
            <LeadForm
              email={email} setEmail={setEmail}
              company={company} setCompany={setCompany}
              role={role} setRole={setRole}
              onSubmit={handleLeadSubmit}
              submitting={submitting}
            />
          )}
        </div>
      )}

      {/* Lead capture (standard) */}
      {!result.isAlreadyOptimal && !result.isHighSavings && !leadCaptured && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-display font-700 text-lg text-slate-800 mb-1">
            Get this report in your inbox
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            We&apos;ll email you the full audit and flag new savings as pricing changes.
          </p>
          {!showLeadForm ? (
            <button
              onClick={() => setShowLeadForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-600 px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Email me this report
            </button>
          ) : (
            <LeadForm
              email={email} setEmail={setEmail}
              company={company} setCompany={setCompany}
              role={role} setRole={setRole}
              onSubmit={handleLeadSubmit}
              submitting={submitting}
            />
          )}
        </div>
      )}

      {leadCaptured && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700 text-sm font-500">Report sent! Check your inbox.</p>
        </div>
      )}

      {/* Share */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-display font-700 text-lg text-slate-800 mb-1">Share this audit</h3>
        <p className="text-slate-500 text-sm mb-4">
          Your personal data is stripped from the public link. Tools and savings numbers are shown.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 text-sm font-mono truncate">
            {shareUrl}
          </div>
          <button
            onClick={copyLink}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all",
              copied
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=Just audited our AI spend with SpendLens — found ${formatCurrency(result.totalMonthlySavings)}/mo in savings 🤯&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-600 hover:bg-slate-900 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Tweet
          </a>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: ToolRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_CONFIG[rec.recommendedAction];
  const Icon = config.icon;

  return (
    <div className={cn(
      "animate-fade-in-up bg-white rounded-2xl border shadow-sm overflow-hidden",
      config.border
    )}>
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-700 text-slate-800">{rec.toolName}</span>
            <span className="text-xs text-slate-400">{rec.currentPlan}</span>
            <span className={cn("text-xs font-600 px-2 py-0.5 rounded-full", config.bg, config.color)}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
            <span>{formatCurrency(rec.currentSpend)}/mo</span>
            {rec.recommendedAction !== "keep" && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span>{formatCurrency(rec.projectedSpend)}/mo</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          {rec.monthlySavings > 0 && (
            <div className="font-display font-700 text-emerald-600 text-lg">
              -{formatCurrency(rec.monthlySavings)}/mo
            </div>
          )}
          {rec.monthlySavings === 0 && (
            <div className="text-slate-400 text-sm">No change</div>
          )}
          <ChevronDown className={cn("w-4 h-4 text-slate-300 ml-auto mt-1 transition-transform", expanded && "rotate-180")} />
        </div>
      </div>

      {expanded && (
        <div className={cn("px-4 pb-4 pt-0 animate-fade-in border-t", config.border)}>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{rec.reason}</p>
          {rec.recommendedPlan && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-slate-400">Recommended plan:</span>
              <span className="font-600 text-slate-700">{rec.recommendedPlan}</span>
            </div>
          )}
          {rec.recommendedTool && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-slate-400">Switch to:</span>
              <span className="font-600 text-slate-700">{rec.recommendedTool}</span>
            </div>
          )}
          {rec.credexApplicable && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Credex discounted credits apply to this tool
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface LeadFormProps {
  email: string; setEmail: (v: string) => void;
  company: string; setCompany: (v: string) => void;
  role: string; setRole: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

function LeadForm({ email, setEmail, company, setCompany, role, setRole, onSubmit, submitting }: LeadFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 animate-fade-in">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50"
        />
      </div>
      {/* Honeypot */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} aria-hidden="true" />
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-600 py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send me the report"}
      </button>
      <p className="text-xs text-slate-400">No spam. One email. Unsubscribe anytime.</p>
    </form>
  );
}
