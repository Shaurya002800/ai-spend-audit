"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolId, UseCaseType, TOOL_NAMES, getToolPlans } from "@/lib/audit-engine";

interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
}

interface FormState {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCaseType;
}

const ALL_TOOLS: ToolId[] = [
  "cursor", "github_copilot", "claude", "chatgpt",
  "anthropic_api", "openai_api", "gemini", "windsurf",
];

const USE_CASE_LABELS: Record<UseCaseType, string> = {
  coding: "💻 Coding / Engineering",
  writing: "✍️ Writing / Content",
  data: "📊 Data / Analytics",
  research: "🔍 Research",
  mixed: "🔀 Mixed / Multiple",
};

const STORAGE_KEY = "spendlens_form_state";

function defaultEntry(toolId: ToolId): ToolEntry {
  const plans = getToolPlans(toolId);
  return { toolId, plan: plans[1] || plans[0], monthlySpend: 0, seats: 1 };
}

interface SpendFormProps {
  onSubmit: (state: FormState) => void;
  isLoading: boolean;
}

export default function SpendForm({ onSubmit, isLoading }: SpendFormProps) {
  const [state, setState] = useState<FormState>({
    tools: [defaultEntry("cursor"), defaultEntry("claude")],
    teamSize: 3,
    useCase: "coding",
  });
  const [addingTool, setAddingTool] = useState(false);

  // Persist form state across reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const addTool = (toolId: ToolId) => {
    if (state.tools.find((t) => t.toolId === toolId)) return;
    setState((s) => ({ ...s, tools: [...s.tools, defaultEntry(toolId)] }));
    setAddingTool(false);
  };

  const removeTool = (index: number) => {
    setState((s) => ({ ...s, tools: s.tools.filter((_, i) => i !== index) }));
  };

  const updateTool = (index: number, field: keyof ToolEntry, value: string | number) => {
    setState((s) => {
      const tools = [...s.tools];
      tools[index] = { ...tools[index], [field]: value };
      // When plan changes, reset to first available plan price
      if (field === "toolId") {
        const plans = getToolPlans(value as ToolId);
        tools[index].plan = plans[1] || plans[0];
        tools[index].monthlySpend = 0;
      }
      return { ...s, tools };
    });
  };

  const totalSpend = state.tools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0);
  const usedToolIds = new Set(state.tools.map((t) => t.toolId));
  const availableTools = ALL_TOOLS.filter((id) => !usedToolIds.has(id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(state);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Team context */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-600">👥</span>
          </div>
          <h2 className="font-display text-xl font-800 text-slate-900">
            About your team
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="animate-fade-in-up">
            <label className="block text-sm font-600 text-slate-700 mb-2.5">
              Team size
              <span className="block text-xs text-slate-400 font-normal mt-0.5">(people using AI tools)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={10000}
                value={state.teamSize}
                onChange={(e) => setState((s) => ({ ...s, teamSize: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50 font-600 hover:border-slate-300"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-500">👤</div>
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <label className="block text-sm font-600 text-slate-700 mb-2.5">
              Primary use case
            </label>
            <div className="relative">
              <select
                value={state.useCase}
                onChange={(e) => setState((s) => ({ ...s, useCase: e.target.value as UseCaseType }))}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50 appearance-none font-500 hover:border-slate-300"
              >
                {(Object.entries(USE_CASE_LABELS) as [UseCaseType, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tool entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">🛠️</span>
            </div>
            <h2 className="font-display text-xl font-800 text-slate-900">
              Your AI tools
            </h2>
          </div>
          <div className="text-sm">
            <span className="text-slate-500">Monthly spend: </span>
            <span className="text-lg font-800 text-emerald-600">${totalSpend.toLocaleString()}/mo</span>
          </div>
        </div>

        <div className="space-y-3 stagger">
          {state.tools.map((tool, index) => (
            <ToolRow
              key={`${tool.toolId}-${index}`}
              tool={tool}
              index={index}
              onUpdate={updateTool}
              onRemove={removeTool}
              canRemove={state.tools.length > 1}
            />
          ))}
        </div>

        {/* Add tool button */}
        {availableTools.length > 0 && (
          <div className="relative">
            {addingTool ? (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-3xl border-2 border-emerald-200 p-6 animate-scale-in shadow-sm">
                <p className="text-sm text-slate-600 mb-4 font-600">Select a tool to add:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTools.map((toolId) => (
                    <button
                      key={toolId}
                      type="button"
                      onClick={() => addTool(toolId)}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-emerald-600 hover:text-white text-slate-700 text-sm font-600 transition-all border border-slate-200 hover:border-emerald-600 shadow-sm hover:shadow-md button-hover"
                    >
                      {TOOL_NAMES[toolId]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddingTool(false)}
                    className="px-4 py-2 rounded-lg bg-white text-slate-400 text-sm hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingTool(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-sm font-600"
              >
                <Plus className="w-5 h-5" />
                Add another tool
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="flex gap-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-5 animate-fade-in-up">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0 flex-shrink-0" />
        <p className="text-sm text-blue-700 font-500 leading-relaxed">
          <strong>Pro tip:</strong> Enter what you <em>actually pay</em>, not list price. Include all seats for per-seat tools. For API tools, enter your average monthly bill.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || state.tools.every((t) => t.monthlySpend === 0)}
        className={cn(
          "w-full py-4 rounded-2xl font-display font-800 text-lg transition-all button-hover",
          "bg-gradient-emerald text-white shadow-lg shadow-emerald-200",
          "hover:shadow-emerald-300 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          "flex items-center justify-center gap-2",
          isLoading && "opacity-90"
        )}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing your stack…
          </>
        ) : (
          <>
            Run My Free Audit
            <span className="text-xl">→</span>
          </>
        )}
      </button>

      {/* Honeypot - hidden from users */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} aria-hidden="true" />
    </form>
  );
}

interface ToolRowProps {
  tool: ToolEntry;
  index: number;
  onUpdate: (index: number, field: keyof ToolEntry, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function ToolRow({ tool, index, onUpdate, onRemove, canRemove }: ToolRowProps) {
  const plans = getToolPlans(tool.toolId);

  return (
    <div className="animate-fade-in-up bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm card-hover">
      <div className="flex items-start gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Tool selector */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-600 text-slate-600 mb-2 uppercase tracking-wider">Tool</label>
            <div className="relative">
              <select
                value={tool.toolId}
                onChange={(e) => onUpdate(index, "toolId", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50 appearance-none font-600 hover:border-slate-300"
              >
                {ALL_TOOLS.map((id) => (
                  <option key={id} value={id}>{TOOL_NAMES[id]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Plan selector */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-600 text-slate-600 mb-2 uppercase tracking-wider">Plan</label>
            <div className="relative">
              <select
                value={tool.plan}
                onChange={(e) => onUpdate(index, "plan", e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50 appearance-none font-500 hover:border-slate-300"
              >
                {plans.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Seats */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-2 uppercase tracking-wider">Seats</label>
            <input
              type="number"
              min={1}
              value={tool.seats}
              onChange={(e) => onUpdate(index, "seats", parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50 font-600 hover:border-slate-300"
            />
          </div>

          {/* Monthly spend */}
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-2 uppercase tracking-wider">Monthly spend</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-600">$</span>
              <input
                type="number"
                min={0}
                step={1}
                value={tool.monthlySpend || ""}
                placeholder="0"
                onChange={(e) => onUpdate(index, "monthlySpend", parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border-2 border-slate-200 pl-7 pr-3 py-2.5 text-slate-800 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition outline-none bg-slate-50 font-600 hover:border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Remove button */}
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-5 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all button-hover"
            aria-label="Remove tool"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
