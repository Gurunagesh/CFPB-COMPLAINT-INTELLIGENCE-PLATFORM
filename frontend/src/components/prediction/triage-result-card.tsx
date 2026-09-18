"use client";

import { Clock, AlertTriangle, ShieldX, Activity } from "lucide-react";
import { TriagePredictionResponse } from "@/types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/status-badge";
import { getOperationalBandBadge } from "@/lib/utils";

interface TriageResultCardProps {
  result: TriagePredictionResponse;
}

export function TriageResultCard({ result }: TriageResultCardProps) {
  const bandBadge = getOperationalBandBadge(result.operational_band);

  return (
    <Card className="border-amber-900/40 bg-gradient-to-b from-slate-950 to-slate-900/90 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <CardTitle>Triage Latency Result</CardTitle>
          </div>
          <CardDescription>Project 2 Inference Output</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={result.model_status || "EXPERIMENTAL"}
            variant="warning"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Prominent Experimental Status Warning Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300 uppercase tracking-wide text-[11px]">
              Experimental / Not Production Approved
            </div>
            <p className="text-slate-300 leading-relaxed">
              Prediction is informational and must not be used as an autonomous operational decision.
              Estimated turnaround does not imply guaranteed resolution time.
            </p>
          </div>
        </div>

        {/* Latency Output Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Predicted Delay (Days) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Estimated Latency (Days)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white font-mono">
                {result.predicted_delay_days.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-medium">days</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Approximate business turnaround
            </p>
          </div>

          {/* Predicted Delay (Hours) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Estimated Latency (Hours)
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-amber-400 font-mono">
                {result.predicted_delay_hours.toFixed(0)}
              </span>
              <span className="text-xs text-slate-400 font-medium">hours</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Intake-to-closure total duration
            </p>
          </div>
        </div>

        {/* Operational Band Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
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

        {/* ML Governance Safety Boundary */}
        <div className="flex items-start gap-2.5 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
          <ShieldX className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-medium text-slate-300">Policy Constraint: </span>
            This model output is restricted to human-in-the-loop analyst queues. Automated routing or customer SLA promises based strictly on this prediction violate system governance rules.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
