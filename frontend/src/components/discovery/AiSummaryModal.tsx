"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2,
} from "lucide-react";
import { PaperSummary } from "@/types";
import { useToast } from "@/context/ToastContext";
import { MathText } from "@/components/common/MathText";

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: PaperSummary | null;
  loading: boolean;
  paperTitle: string;
}

export function AiSummaryModal({
  isOpen,
  onClose,
  summary,
  loading,
  paperTitle,
}: AiSummaryModalProps) {
  const { success: toastSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!summary) return;
    const text = `Title: ${summary.title}\n\nTL;DR: ${summary.oneSentenceSummary}\n\nCore Problem: ${summary.coreProblem}\n\nMethodology:\n${summary.methodology.map((m) => "- " + m).join("\n")}\n\nKey Findings:\n${summary.keyFindings.map((f) => "- " + f).join("\n")}\n\nPractical Applications:\n${summary.practicalApplications.map((a) => "- " + a).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toastSuccess("Copied to Clipboard", "Executive summary copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  const isGemini = summary?.provider?.toLowerCase().includes("gemini");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel rounded-3xl shadow-2xl border border-indigo-500/30 z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  AI Research Digest
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {loading
                    ? "Synthesizing..."
                    : isGemini
                      ? "Neural AI Engine"
                      : "NLP Heuristic Engine"}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                <MathText text={paperTitle} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {summary && !loading && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Copy markdown"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-spin">
                  <Loader2 className="w-8 h-8 text-indigo-400" />
                </div>
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  Synthesizing Paper Abstract
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Extracting key problem bottlenecks, technical methodology,
                  benchmark results, and production takeaways...
                </p>
              </div>
            </div>
          ) : summary ? (
            <>
              {/* 1. TL;DR */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/5 border border-indigo-500/30 shadow-inner space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Executive TL;DR
                </div>
                <div className="text-sm font-medium text-slate-100 leading-relaxed">
                  <MathText text={summary.oneSentenceSummary} />
                </div>
              </div>

              {/* 2. Core Problem */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-300">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  The Problem & Bottleneck
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 leading-relaxed text-xs sm:text-sm">
                  <MathText text={summary.coreProblem} />
                </div>
              </div>

              {/* 3. Methodology */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  Methodology & Key Innovations
                </div>
                <div className="space-y-1.5">
                  {summary.methodology.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5 text-xs sm:text-sm text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>
                        <MathText text={m} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Key Findings */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Measurable Breakthroughs & Findings
                </div>
                <div className="space-y-1.5">
                  {summary.keyFindings.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-100"
                    >
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <MathText text={f} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Practical Applications */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-300">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  Engineering & Industry Use Cases
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {summary.practicalApplications.map((app, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 text-xs text-sky-100 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 mt-1.5" />
                      <span>
                        <MathText text={app} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Unable to generate summary. Please try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
