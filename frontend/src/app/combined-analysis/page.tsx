"use client";

import { useState } from "react";
import { Layers, Send, RotateCcw, Calendar } from "lucide-react";
import { predictCombined } from "@/lib/api/combined";
import { ApiError } from "@/lib/api/client";
import { CombinedPredictionResponse } from "@/types/api";
import { combinedPredictionSchema } from "@/lib/validation/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SamplePicker } from "@/components/forms/sample-picker";
import { ProductResultCard } from "@/components/prediction/product-result-card";
import { TriageResultCard } from "@/components/prediction/triage-result-card";
import { getCurrentDateTimeISO } from "@/lib/utils";
import { SampleComplaint } from "@/lib/samples";

export default function CombinedAnalysisPage() {
  const [narrative, setNarrative] = useState("");
  const [company, setCompany] = useState("");
  const [dateReceived, setDateReceived] = useState(getCurrentDateTimeISO().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CombinedPredictionResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSelectSample = (sample: SampleComplaint) => {
    setNarrative(sample.narrative);
    setCompany(sample.company);
    if (sample.dateReceived) {
      setDateReceived(sample.dateReceived.slice(0, 16));
    }
    setValidationError(null);
    setApiError(null);
  };

  const handleSetNow = () => {
    setDateReceived(getCurrentDateTimeISO().slice(0, 16));
  };

  const handleClear = () => {
    setNarrative("");
    setCompany("");
    handleSetNow();
    setResult(null);
    setValidationError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const isoString = dateReceived.includes("T") ? `${dateReceived}:00` : new Date(dateReceived).toISOString();

    const validation = combinedPredictionSchema.safeParse({
      narrative,
      company,
      date_received: isoString,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      setValidationError(firstError);
      return;
    }

    setLoading(true);
    try {
      const res = await predictCombined({
        narrative: validation.data.narrative,
        company: validation.data.company,
        date_received: validation.data.date_received,
      });
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with combined prediction service.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Combined Analysis Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Unified intake gateway dispatching a single complaint to both Project 1 (Product Classification) and Project 2 (Triage Intelligence).
        </p>
      </div>

      {/* Intake Parameters Form */}
      <Card className="border-slate-800 bg-slate-950/70">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <CardTitle>Unified Intake Submission</CardTitle>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded">
              Dual Pipeline Execution
            </span>
          </div>
          <CardDescription>
            Enter complaint data once to evaluate product categorization and turnaround latency simultaneously.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Synthetic Demonstration Picker */}
            <SamplePicker onSelect={handleSelectSample} disabled={loading} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Received */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="date-received"
                    className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Date Received <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSetNow}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                  >
                    Current Time
                  </button>
                </div>
                <input
                  id="date-received"
                  type="datetime-local"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 font-mono"
                />
              </div>

              {/* Company Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="company"
                  className="text-xs font-semibold text-slate-300"
                >
                  Financial Institution / Company <span className="text-rose-400">*</span>
                </label>
                <input
                  id="company"
                  type="text"
                  required
                  placeholder="e.g. JPMORGAN CHASE & CO."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Narrative Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="narrative"
                  className="text-xs font-semibold text-slate-300"
                >
                  Consumer Complaint Narrative <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    narrative.length < 10
                      ? "text-slate-400"
                      : narrative.length > 20000
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {narrative.length.toLocaleString()} / 20,000 characters
                </span>
              </div>

              <textarea
                id="narrative"
                required
                rows={5}
                placeholder="Paste consumer complaint narrative..."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 leading-relaxed resize-y font-sans"
              />
            </div>

            {/* Error Handlers */}
            {validationError && (
              <Alert variant="warning">
                <AlertTitle>Validation Issue</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {apiError && (
              <Alert variant="destructive">
                <AlertTitle>Combined Analysis Error</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={loading || (!narrative && !company)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear Form
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                disabled={loading || narrative.trim().length < 10 || company.trim().length < 2}
              >
                <Send className="h-3.5 w-3.5" />
                Execute Combined Inference
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Analytical Results Grid */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
          <Card className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Dual Analytical Outputs
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Card: Product Classification */}
            <ProductResultCard result={result.product_prediction} />

            {/* Right Card: Triage Intelligence */}
            <TriageResultCard result={result.triage_prediction} />
          </div>
        </div>
      )}
    </div>
  );
}
