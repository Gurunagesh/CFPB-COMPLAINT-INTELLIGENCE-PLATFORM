"use client";

import { useState } from "react";
import { Clock, AlertTriangle, ShieldX, Activity, Copy, Check, Code } from "lucide-react";
import { TriagePredictionResponse } from "@/types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/status-badge";
import { getOperationalBandBadge } from "@/lib/utils";
import { useDevMode } from "@/lib/context/dev-mode-context";
import { useToast } from "@/lib/context/toast-context";
import { formatTriageSummary } from "@/lib/export";

interface TriageResultCardProps {
  result: TriagePredictionResponse;
  narrative?: string;
  company?: string;
  dateReceived?: string;
}

export function TriageResultCard({
  result,
  narrative = "",
  company = "",
  dateReceived = "",
}: TriageResultCardProps) {
  const bandBadge = getOperationalBandBadge(result.operational_band);
  const { isDevMode } = useDevMode();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showDevJson, setShowDevJson] = useState(false);

  const handleCopy = async () => {
    try {
      const text = formatTriageSummary(result, { narrative, company, dateReceived });
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Triage Summary Copied", "Formatted triage summary copied to clipboard.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Copy Failed", "Please copy the text manually.");
    }
  };

  return (
    <Card className="border-amber-900/40 bg-gradient-to-b from-slate-950 to-slate-900/90 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <CardTitle>Triage Latency Intelligence</CardTitle>
          </div>
          <CardDescription>Project 2 • Intake-to-Company Routing Delay</CardDescription>
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
          <StatusBadge
            status={result.model_status || "EXPERIMENTAL"}
            variant="warning"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Prominent Experimental Status Warning Banner (Always visible in all modes) */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-950/25 p-4 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300 uppercase tracking-wide text-[11px] flex items-center gap-2">
              <span>Experimental Model — Not Production Approved</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Prediction is informational only. <span className="font-semibold text-amber-200">Autonomous decisioning is strictly prohibited.</span> This value estimates internal intake delay to company forwarding, NOT consumer complaint resolution time.
            </p>
          </div>
        </div>

        {/* Estimated Delay Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Estimated Triage Delay (Days) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Estimated Triage Delay (Days)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white font-mono">
                {result.predicted_delay_days.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">days</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Estimated intake-to-company delay
            </p>
          </div>

          {/* Estimated Triage Delay (Hours) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Estimated Triage Delay (Hours)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-amber-400 font-mono">
                {result.predicted_delay_hours.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-medium">hours</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Equivalent duration in hours
            </p>
          </div>
        </div>

        {/* Operational Band */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Activity className="h-3.5 w-3.5 text-slate-400" />
              <span>Assigned Operational Band</span>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${bandBadge.style}`}
            >
              {bandBadge.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {bandBadge.description}
          </p>
        </div>

        {/* Mandatory Governance Constraint */}
        <div className="flex items-start gap-2.5 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
          <ShieldX className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-medium text-slate-300">Governance Policy: </span>
            This model output is restricted to informational dashboards. Autonomous routing, automated escalation, or customer SLA guarantees based on this prediction are prohibited.
          </div>
        </div>

        {/* Developer Mode Inspector with Baseline Comparison */}
        {isDevMode && (
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" /> Dev Inspector: Project 2 (Baseline Audit)
              </span>
              <button
                type="button"
                onClick={() => setShowDevJson(!showDevJson)}
                className="text-[10px] font-mono text-slate-400 hover:text-white underline"
              >
                {showDevJson ? "Hide Raw JSON" : "View Raw Response"}
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <div>Architecture: <span className="text-slate-200">Ridge Regression (log1p transform)</span></div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div>Model MAE: <span className="text-rose-400">0.4512 days</span></div>
                <div>Baseline MAE: <span className="text-emerald-400">0.1764 days</span></div>
                <div>Model R²: <span className="text-rose-400">-0.2757</span></div>
                <div>Baseline R²: <span className="text-slate-300">-0.0136</span></div>
              </div>
              <div className="text-[10px] text-amber-300/80 pt-1">
                Audit Result: Model did not outperform the baseline. Production deployment disallowed.
              </div>
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
