"use client";

import { useState } from "react";
import { Tag, HelpCircle, ShieldAlert, BarChart3, Copy, Check, Code } from "lucide-react";
import { ProductPredictionResponse } from "@/types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/status-badge";
import { formatConfidence, getConfidenceAssessment } from "@/lib/utils";
import { ProbabilityChart } from "./probability-chart";
import { TextualSignalsPanel } from "./textual-signals-panel";
import { useDevMode } from "@/lib/context/dev-mode-context";
import { useToast } from "@/lib/context/toast-context";
import { formatProductSummary } from "@/lib/export";

interface ProductResultCardProps {
  result: ProductPredictionResponse;
  narrative?: string;
  company?: string;
}

export function ProductResultCard({ result, narrative = "", company = "" }: ProductResultCardProps) {
  const assessment = getConfidenceAssessment(result.confidence);
  const { isDevMode } = useDevMode();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showDevJson, setShowDevJson] = useState(false);

  const handleCopy = async () => {
    try {
      const text = formatProductSummary(result, { narrative, company });
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Analysis Summary Copied", "Formatted summary copied to clipboard.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Copy Failed", "Please copy the text manually.");
    }
  };

  return (
    <Card className="border-indigo-900/40 bg-gradient-to-b from-slate-950 to-slate-900/90 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-400" />
            <CardTitle>Product Classification Result</CardTitle>
          </div>
          <CardDescription>Project 1 • Multi-Class NLP Categorization</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-900/80 px-2 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Copy Analysis Summary"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
          <StatusBadge status={result.model_status || "VERIFIED"} variant="success" />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Predicted Product Banner */}
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            Predicted Product Category
          </span>
          <div className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {result.predicted_product}
          </div>
        </div>

        {/* Model Probability Metric */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Model Probability</span>
            <span className="font-mono font-bold text-indigo-400 text-sm">
              {formatConfidence(result.confidence)}
            </span>
          </div>

          {/* Probability Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${Math.min(result.confidence * 100, 100)}%` }}
            />
          </div>

          {/* Guidance Note */}
          <div className="flex items-start gap-2 pt-1 text-xs text-slate-400">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-slate-300">{assessment.label}: </span>
              {assessment.description}
            </div>
          </div>
        </div>

        {/* Top Predictions Distribution */}
        {result.top_predictions && result.top_predictions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                <span>Prediction Probability Distribution</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {result.top_predictions.length} Categories
              </span>
            </div>

            <ProbabilityChart data={result.top_predictions} />
          </div>
        )}

        {/* Detected Textual Signals (if narrative provided) */}
        {narrative && <TextualSignalsPanel narrative={narrative} />}

        {/* Governance Notice */}
        <div className="flex items-start gap-2.5 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
          <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-medium text-slate-300">Governance Notice: </span>
            Statistical inference; not verified ground truth. Probabilities represent model-assigned class likelihoods based on complaint text and company features.
          </div>
        </div>

        {/* Developer Mode Inspector */}
        {isDevMode && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" /> Dev Inspector: Project 1
              </span>
              <button
                type="button"
                onClick={() => setShowDevJson(!showDevJson)}
                className="text-[10px] font-mono text-slate-400 hover:text-white underline"
              >
                {showDevJson ? "Hide Raw JSON" : "View Raw Response"}
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 grid grid-cols-2 gap-2">
              <div>Model: <span className="text-slate-200">Logistic Regression</span></div>
              <div>Vectorizer: <span className="text-slate-200">Word + Char TF-IDF</span></div>
              <div>Test Accuracy: <span className="text-emerald-400">86.51%</span></div>
              <div>Weighted F1: <span className="text-emerald-400">86.32%</span></div>
            </div>

            {showDevJson && (
              <pre className="p-2 rounded bg-slate-900 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
