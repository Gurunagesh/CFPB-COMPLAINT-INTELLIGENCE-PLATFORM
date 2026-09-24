"use client";

import { useState } from "react";
import { Layers, Send, RotateCcw, Calendar, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { predictCombined } from "@/lib/api/combined";
import { ApiError } from "@/lib/api/client";
import { CombinedPredictionResponse } from "@/types/api";
import { combinedPredictionSchema } from "@/lib/validation/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SamplePicker } from "@/components/forms/sample-picker";
import { CharacterCounter } from "@/components/forms/character-counter";
import { ProductResultCard } from "@/components/prediction/product-result-card";
import { TriageResultCard } from "@/components/prediction/triage-result-card";
import { getCurrentDateTimeISO } from "@/lib/utils";
import { SampleComplaint } from "@/lib/samples";
import { useToast } from "@/lib/context/toast-context";
import { addSessionHistoryItem } from "@/lib/history";

export default function CombinedAnalysisPage() {
  const { toast } = useToast();
  const [narrative, setNarrative] = useState("");
  const [company, setCompany] = useState("");
  const [dateReceived, setDateReceived] = useState(getCurrentDateTimeISO().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [result, setResult] = useState<CombinedPredictionResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleSelectSample = (sample: SampleComplaint) => {
    setNarrative(sample.narrative);
    setCompany(sample.company);
    setSelectedSampleId(sample.id);
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
    setSelectedSampleId(null);
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
    const warmupTimer = setTimeout(() => setIsWarmingUp(true), 3500);

    try {
      const res = await predictCombined({
        narrative: validation.data.narrative,
        company: validation.data.company,
        date_received: validation.data.date_received,
      });
      setResult(res);
      addSessionHistoryItem(
        validation.data.narrative,
        validation.data.company,
        validation.data.date_received,
        res
      );
      toast.success("Unified Analysis Complete", "Classification and triage estimates loaded.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with combined prediction service.");
      }
      toast.error("Analysis Failed", "Unable to complete combined analysis.");
    } finally {
      clearTimeout(warmupTimer);
      setIsWarmingUp(false);
      setLoading(false);
    }
  };

  const isFormValid = narrative.trim().length >= 10 && narrative.trim().length <= 20000 && company.trim().length >= 2;

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-800 bg-slate-950/70">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <CardTitle>Unified Complaint Intake Details</CardTitle>
                </div>
                {narrative && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              <CardDescription>
                Execute multi-class categorization and triage turnaround prediction simultaneously.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Synthetic Preset Picker */}
                <SamplePicker
                  onSelect={handleSelectSample}
                  disabled={loading}
                  selectedId={selectedSampleId}
                />

                {/* Grid for Company & Date Inputs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Company Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="company"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Target Institution / Company <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="company"
                      type="text"
                      required
                      placeholder="e.g. EQUIFAX, INC. or JPMORGAN CHASE & CO."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <span className="text-[10px] text-slate-500">
                      Min 2 characters, max 500 characters
                    </span>
                  </div>

                  {/* Date Received Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="dateReceived"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                      >
                        Intake Timestamp <span className="text-cyan-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSetNow}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Set Current Time
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="dateReceived"
                        type="datetime-local"
                        required
                        value={dateReceived}
                        onChange={(e) => setDateReceived(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                      />
                      <Calendar className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Narrative Textarea */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="narrative"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Consumer Complaint Narrative <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    id="narrative"
                    rows={7}
                    required
                    placeholder="Enter full grievance narrative..."
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 leading-relaxed font-sans"
                  />
                  <CharacterCounter currentLength={narrative.length} />
                </div>

                {/* Validation and Error Alerts */}
                {validationError && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {apiError && (
                  <div className="rounded-lg border border-rose-800/80 bg-rose-950/30 p-3.5 text-xs text-rose-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Gateway Service Notice
                    </div>
                    <p className="text-slate-300 leading-relaxed">{apiError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSubmit}
                      className="border-rose-700/60 text-xs mt-1"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Retry Request
                    </Button>
                  </div>
                )}

                {isWarmingUp && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-300 animate-pulse">
                    <Clock className="h-4 w-4 shrink-0 text-cyan-400 animate-spin" />
                    <span>
                      Waking the inference service. The backend may take a little longer on its first request.
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={!isFormValid || loading}
                    isLoading={loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 text-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {loading ? "Running Dual Pipeline Inference..." : "Run Unified Analysis"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              <ProductResultCard
                result={result.product_prediction}
                narrative={narrative}
                company={company}
              />
              <TriageResultCard
                result={result.triage_prediction}
                narrative={narrative}
                company={company}
                dateReceived={dateReceived}
              />
            </div>
          ) : (
            <Card className="border-slate-800 bg-slate-950/40 p-6 flex flex-col items-center justify-center text-center min-h-[360px] space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-cyan-400">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Awaiting Combined Intake</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Submit a complaint narrative to execute both Project 1 (Product Classification) and Project 2 (Triage Delay) simultaneously.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
