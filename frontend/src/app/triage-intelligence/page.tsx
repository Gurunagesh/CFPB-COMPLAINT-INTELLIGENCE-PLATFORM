"use client";

import { useState } from "react";
import { Clock, Send, RotateCcw, Calendar } from "lucide-react";
import { predictTriage } from "@/lib/api/project2";
import { ApiError } from "@/lib/api/client";
import { TriagePredictionResponse } from "@/types/api";
import { triagePredictionSchema } from "@/lib/validation/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SamplePicker } from "@/components/forms/sample-picker";
import { TriageResultCard } from "@/components/prediction/triage-result-card";
import { getCurrentDateTimeISO } from "@/lib/utils";
import { SampleComplaint } from "@/lib/samples";

export default function TriageIntelligencePage() {
  const [narrative, setNarrative] = useState("");
  const [company, setCompany] = useState("");
  const [dateReceived, setDateReceived] = useState(getCurrentDateTimeISO().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriagePredictionResponse | null>(null);
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

    // Format ISO string for FastAPI datetime parser
    const isoString = dateReceived.includes("T") ? `${dateReceived}:00` : new Date(dateReceived).toISOString();

    const validation = triagePredictionSchema.safeParse({
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
      const res = await predictTriage({
        narrative: validation.data.narrative,
        company: validation.data.company,
        date_received: validation.data.date_received,
      });
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with triage prediction service.");
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
          Triage Latency Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Project 2 • Machine learning estimation of complaint intake turnaround latency and operational risk tiering.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-800 bg-slate-950/70">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <CardTitle>Intake Parameters</CardTitle>
                </div>
              </div>
              <CardDescription>
                Input complaint timestamp, narrative, and company for turnaround prediction.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Synthetic Preset Picker */}
                <SamplePicker onSelect={handleSelectSample} disabled={loading} />

                {/* Date Received Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="date-received"
                      className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Date & Time Received <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSetNow}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                    >
                      Set Current Time
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
                  <span className="text-[10px] text-slate-400">
                    CFPB recorded intake timestamp
                  </span>
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
                    placeholder="e.g. WELLS FARGO & COMPANY"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-400">
                    Min 2 characters, max 500 characters
                  </span>
                </div>

                {/* Narrative Textarea */}
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
                    rows={8}
                    placeholder="Consumer complaint details..."
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 leading-relaxed resize-y font-sans"
                  />
                </div>

                {/* Validation Errors */}
                {validationError && (
                  <Alert variant="warning">
                    <AlertTitle>Input Validation Error</AlertTitle>
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}

                {/* API Errors */}
                {apiError && (
                  <Alert variant="destructive">
                    <AlertTitle>Triage Inference Error</AlertTitle>
                    <AlertDescription>{apiError}</AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
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
                    Estimate Triage Latency
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {loading && (
            <Card className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
            </Card>
          )}

          {!loading && result && (
            <TriageResultCard result={result} />
          )}

          {!loading && !result && (
            <Card className="border-dashed border-slate-800 bg-slate-950/30 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-500">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-300">
                Awaiting Triage Parameters
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Provide intake details to compute predicted resolution latency, hours, and operational response tiering.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
