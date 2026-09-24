"use client";

import { useState } from "react";
import { Clock, Send, RotateCcw, Calendar, AlertTriangle, AlertCircle } from "lucide-react";
import { predictTriage } from "@/lib/api/project2";
import { ApiError } from "@/lib/api/client";
import { TriagePredictionResponse } from "@/types/api";
import { triagePredictionSchema } from "@/lib/validation/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SamplePicker } from "@/components/forms/sample-picker";
import { CharacterCounter } from "@/components/forms/character-counter";
import { TriageResultCard } from "@/components/prediction/triage-result-card";
import { getCurrentDateTimeISO } from "@/lib/utils";
import { SampleComplaint } from "@/lib/samples";
import { useToast } from "@/lib/context/toast-context";

export default function TriageIntelligencePage() {
  const { toast } = useToast();
  const [narrative, setNarrative] = useState("");
  const [company, setCompany] = useState("");
  const [dateReceived, setDateReceived] = useState(getCurrentDateTimeISO().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [result, setResult] = useState<TriagePredictionResponse | null>(null);
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
    const warmupTimer = setTimeout(() => setIsWarmingUp(true), 3500);

    try {
      const res = await predictTriage({
        narrative: validation.data.narrative,
        company: validation.data.company,
        date_received: validation.data.date_received,
      });
      setResult(res);
      toast.success("Triage Estimation Complete", `Delay: ${res.predicted_delay_days.toFixed(1)} days`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with triage prediction service.");
      }
      toast.error("Triage Failed", "Unable to complete triage prediction.");
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
          Triage Latency Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Project 2 • Estimation of intake-to-company forwarding delay and operational risk tiering.
        </p>
      </div>

      {/* Prominent Operational Disclaimer Banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px]">
              Model Governance Status: Experimental / Informational Only
            </span>
            <p className="text-slate-300 leading-relaxed">
              This model estimates internal intake routing delay. <strong>Autonomous decisioning is prohibited.</strong> In benchmark evaluations, this model did not outperform the naive historical baseline ($R^2 = -0.2757$).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-800 bg-slate-950/70">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <CardTitle>Triage Intake Details</CardTitle>
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
                Provide grievance text, financial institution, and intake timestamp to evaluate expected routing delay.
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

                {/* Company Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="company"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Financial Institution / Company <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    required
                    placeholder="e.g. WELLS FARGO & COMPANY or CITIBANK, N.A."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
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
                      Intake Date Received (Point-in-Time) <span className="text-amber-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSetNow}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Set Current Timestamp
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
                      className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                {/* Narrative Textarea */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="narrative"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Consumer Complaint Narrative <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    id="narrative"
                    rows={7}
                    required
                    placeholder="Enter consumer grievance narrative..."
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50 leading-relaxed font-sans"
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
                      <AlertTriangle className="h-4 w-4" /> Triage Service Notice
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
                  <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-300 animate-pulse">
                    <Clock className="h-4 w-4 shrink-0 text-amber-400 animate-spin" />
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
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 text-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {loading ? "Estimating Triage Delay..." : "Run Triage Delay Estimation"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <TriageResultCard
              result={result}
              narrative={narrative}
              company={company}
              dateReceived={dateReceived}
            />
          ) : (
            <Card className="border-slate-800 bg-slate-950/40 p-6 flex flex-col items-center justify-center text-center min-h-[360px] space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Awaiting Triage Intake</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Enter grievance text and intake timestamp to calculate estimated triage delay in days and hours.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
