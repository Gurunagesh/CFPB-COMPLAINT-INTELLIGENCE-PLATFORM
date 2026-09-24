"use client";

import { useState } from "react";
import { Play, RotateCw, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { SYNTHETIC_SAMPLES } from "@/lib/samples";
import { predictCombined } from "@/lib/api/combined";
import { CombinedPredictionResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { formatConfidence } from "@/lib/utils";

interface BenchmarkResult {
  sampleId: string;
  sampleBadge: string;
  sampleTitle: string;
  company: string;
  predictedProduct: string;
  confidence: number;
  predictedDelayDays: number;
  predictedDelayHours: number;
  p1Status: string;
  p2Status: string;
  operationalBand: string;
}

export function BenchmarkSuite() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const benchmarkPromises = SYNTHETIC_SAMPLES.map(async (sample) => {
        const dateReceived = sample.dateReceived || "2026-09-20T12:00:00";
        const res: CombinedPredictionResponse = await predictCombined({
          narrative: sample.narrative,
          company: sample.company,
          date_received: dateReceived,
        });

        return {
          sampleId: sample.id,
          sampleBadge: sample.badge,
          sampleTitle: sample.title,
          company: sample.company,
          predictedProduct: res.product_prediction.predicted_product,
          confidence: res.product_prediction.confidence,
          predictedDelayDays: res.triage_prediction.predicted_delay_days,
          predictedDelayHours: res.triage_prediction.predicted_delay_hours,
          p1Status: res.product_prediction.model_status || "VERIFIED",
          p2Status: res.triage_prediction.model_status || "EXPERIMENTAL",
          operationalBand: res.triage_prediction.operational_band,
        };
      });

      const executed = await Promise.all(benchmarkPromises);
      setResults(executed);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to execute benchmark suite. Please ensure backend is reachable."
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Interactive Test Suite
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Synthetic Benchmark Evaluation Suite
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Executes multiple synthetic test complaints simultaneously across both Project 1 and Project 2 pipelines.
          </p>
        </div>

        <Button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 text-xs font-medium"
        >
          {isRunning ? (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Running Benchmark (4 Scenarios)...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Run Benchmark Scenarios
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-800 bg-rose-950/30 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-3 pt-2">
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Demonstration Scenario</th>
                  <th className="px-4 py-3">Target Company</th>
                  <th className="px-4 py-3">Predicted Product (P1)</th>
                  <th className="px-4 py-3">Model Probability</th>
                  <th className="px-4 py-3">Estimated Triage Delay (P2)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono text-[11px]">
                {results.map((row) => (
                  <tr key={row.sampleId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-sans font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
                        <span>{row.sampleBadge}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{row.company}</td>
                    <td className="px-4 py-3 text-indigo-300 font-sans font-medium">
                      {row.predictedProduct}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatConfidence(row.confidence)}
                    </td>
                    <td className="px-4 py-3 text-amber-300">
                      {row.predictedDelayDays.toFixed(2)}d (≈{row.predictedDelayHours.toFixed(0)}h)
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-2.5 w-2.5" /> P1 Verified
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="h-2.5 w-2.5" /> P2 Exp.
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 p-2 bg-slate-900/40 rounded border border-slate-800/80">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>
              <strong>Demonstration Notice:</strong> Scenarios are synthetic test cases and do not represent official CFPB case decisions. Project 2 predictions remain experimental.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
