"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Send,
  RotateCcw,
  Sparkles,
  Layers,
  AlertCircle,
  Clock,
  Activity,
  Code,
  AlertTriangle,
} from "lucide-react";
import { predictCombined } from "@/lib/api/combined";
import { getHealth, getReadiness, getModels } from "@/lib/api/system";
import { ApiError } from "@/lib/api/client";
import { CombinedPredictionResponse, ModelsResponse } from "@/types/api";
import { combinedPredictionSchema } from "@/lib/validation/schemas";
import { SYNTHETIC_SAMPLES, SampleComplaint } from "@/lib/samples";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterCounter } from "@/components/forms/character-counter";
import { ProductResultCard } from "@/components/prediction/product-result-card";
import { TriageResultCard } from "@/components/prediction/triage-result-card";
import { BenchmarkSuite } from "@/components/prediction/benchmark-suite";
import { SessionHistoryTray } from "@/components/prediction/session-history-tray";
import { getCurrentDateTimeISO } from "@/lib/utils";
import { getSessionHistory, addSessionHistoryItem, clearSessionHistory, SessionHistoryItem } from "@/lib/history";
import { useDevMode } from "@/lib/context/dev-mode-context";
import { useToast } from "@/lib/context/toast-context";

export default function HomePage() {
  const { isDevMode } = useDevMode();
  const { toast } = useToast();

  const [narrative, setNarrative] = useState("");
  const [company, setCompany] = useState("");
  const [dateReceived, setDateReceived] = useState(getCurrentDateTimeISO().slice(0, 16));
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [result, setResult] = useState<CombinedPredictionResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Session history
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);

  // Telemetry for Dev Mode
  const [models, setModels] = useState<ModelsResponse | null>(null);

  // Non-blocking pre-warming ping on mount
  useEffect(() => {
    async function prewarm() {
      try {
        const [, , mRes] = await Promise.allSettled([
          getHealth(),
          getReadiness(),
          getModels(),
        ]);
        if (mRes.status === "fulfilled") setModels(mRes.value);
      } catch {
        // Non-blocking catch
      }
    }
    prewarm();
    setHistory(getSessionHistory());
  }, []);

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

  const handleClear = () => {
    setNarrative("");
    setCompany("");
    setSelectedSampleId(null);
    setDateReceived(getCurrentDateTimeISO().slice(0, 16));
    setResult(null);
    setValidationError(null);
    setApiError(null);
  };

  const handleRestoreHistory = (item: SessionHistoryItem) => {
    setNarrative(item.fullNarrative);
    setCompany(item.company === "N/A" ? "" : item.company);
    setDateReceived(item.dateReceived || getCurrentDateTimeISO().slice(0, 16));
    setResult(item.fullResult);
    setValidationError(null);
    setApiError(null);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleClearHistory = () => {
    clearSessionHistory();
    setHistory([]);
    toast.info("History Cleared", "Session inference history was reset.");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const isoString = dateReceived.includes("T")
      ? `${dateReceived}:00`
      : new Date(dateReceived).toISOString();

    const validation = combinedPredictionSchema.safeParse({
      narrative,
      company: company || "UNSPECIFIED FINANCIAL INSTITUTION",
      date_received: isoString,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      setValidationError(firstError);
      return;
    }

    setLoading(true);
    // Timer to detect potential cold-start delay
    const warmupTimer = setTimeout(() => {
      setIsWarmingUp(true);
    }, 3500);

    try {
      const res = await predictCombined({
        narrative: validation.data.narrative,
        company: validation.data.company,
        date_received: validation.data.date_received,
      });

      setResult(res);
      const updatedHistory = addSessionHistoryItem(
        validation.data.narrative,
        validation.data.company,
        validation.data.date_received,
        res
      );
      setHistory(updatedHistory);
      toast.success("Inference Complete", "Project 1 and Project 2 predictions loaded.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with prediction gateway. Please verify network connection.");
      }
      toast.error("Prediction Failed", "Unable to complete inference request.");
    } finally {
      clearTimeout(warmupTimer);
      setIsWarmingUp(false);
      setLoading(false);
    }
  };

  const isFormValid = narrative.trim().length >= 10 && narrative.trim().length <= 20000;

  return (
    <div className="space-y-8">
      {/* Action-First Hero Section */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            CFPB Machine Learning Inference Platform
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Consumer Complaint Intelligence Platform
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed sm:text-base">
            Analyze a consumer complaint using deployed machine learning models. Instantly predict the primary financial product category and forecast estimated intake triage delay.
          </p>
        </div>

        {/* 1-Click Synthetic Demonstration Presets */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">Try Synthetic Demonstration Scenarios:</span>
            <span className="text-[10px] text-slate-400">(Click to auto-populate test narrative)</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SYNTHETIC_SAMPLES.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/70 text-indigo-200 ring-1 ring-indigo-500"
                      : "border-slate-800 bg-slate-900/90 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="font-semibold">{sample.badge}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    — {sample.company.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Note: Demonstration inputs are synthetic test cases and do not contain real consumer PII or official CFPB case dispositions.
          </p>
        </div>
      </div>

      {/* Main Intake Form & Inference Interface */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-800 bg-slate-950/80 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <CardTitle>Complaint Intake Analysis</CardTitle>
                </div>
                {narrative && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear form
                  </button>
                )}
              </div>
              <CardDescription>
                Submit complaint narrative to dispatch unified inference to Project 1 (Product Classification) and Project 2 (Triage Intelligence).
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Complaint Narrative Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="narrative"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Consumer Complaint Narrative <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    id="narrative"
                    rows={6}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="Enter the consumer grievance narrative or click one of the synthetic scenario buttons above (10 to 20,000 characters)..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/90 p-3.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors leading-relaxed"
                  />
                  {/* Live Character Counter */}
                  <CharacterCounter currentLength={narrative.length} />
                </div>

                {/* Institution & Timestamp Inputs Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="company"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Target Financial Institution
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. EQUIFAX, INC. or CITIBANK, N.A."
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="dateReceived"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Intake Date Received
                    </label>
                    <input
                      id="dateReceived"
                      type="datetime-local"
                      value={dateReceived}
                      onChange={(e) => setDateReceived(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-slate-100 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Validation & Error Alerts */}
                {validationError && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {apiError && (
                  <div className="rounded-lg border border-rose-800/80 bg-rose-950/30 p-3.5 text-xs text-rose-300 space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Inference Service Notice
                    </div>
                    <p className="text-slate-300 leading-relaxed">{apiError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubmit()}
                      className="border-rose-700/60 text-xs mt-1"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Retry Request
                    </Button>
                  </div>
                )}

                {/* Cold-Start Informational Banner */}
                {isWarmingUp && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-3 text-xs text-indigo-300 animate-pulse">
                    <Clock className="h-4 w-4 shrink-0 text-indigo-400 animate-spin" />
                    <span>
                      Waking the inference service. The backend may take a little longer on its first request.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!isFormValid || loading}
                    isLoading={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {loading ? "Running Dual ML Inference..." : "Analyze Complaint Now"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Project 1 Output */}
              <ProductResultCard
                result={result.product_prediction}
                narrative={narrative}
                company={company}
              />

              {/* Project 2 Output */}
              <TriageResultCard
                result={result.triage_prediction}
                narrative={narrative}
                company={company}
                dateReceived={dateReceived}
              />
            </div>
          ) : (
            <Card className="border-slate-800 bg-slate-950/40 p-6 flex flex-col items-center justify-center text-center min-h-[380px] space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Awaiting Intake Submission</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Choose one of the synthetic presets above or paste a complaint narrative to execute multi-class categorization and triage delay estimation.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Session History Tray */}
      <SessionHistoryTray
        history={history}
        onSelect={handleRestoreHistory}
        onClear={handleClearHistory}
      />

      {/* Benchmark Demo Suite */}
      <BenchmarkSuite />

      {/* Architecture & Governance Specification (Expanded in Developer Mode) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              System Architecture & ML Pipeline
            </h3>
          </div>
          {isDevMode && (
            <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/30 bg-indigo-950/40 px-2 py-0.5 rounded">
              Developer Telemetry Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              1. Intake Validation & Preprocessing
            </span>
            <p className="text-slate-400 leading-relaxed">
              Zod & Pydantic enforce 10–20,000 character boundaries. Submissions are processed without logging consumer PII or unredacted personal data.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              2. Independent Scikit-Learn Workers
            </span>
            <p className="text-slate-400 leading-relaxed">
              Project 1 applies Logistic Regression over Word+Char TF-IDF to predict product classes. Project 2 evaluates log1p Ridge Regression for routing latency.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              3. Governance & Decisioning Rules
            </span>
            <p className="text-slate-400 leading-relaxed">
              Strict governance disclaimers are enforced. Project 2 is marked experimental; autonomous decisions and SLA promises based on inference are prohibited.
            </p>
          </div>
        </div>

        {/* Developer Mode Extended Telemetry */}
        {isDevMode && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400">
              <Code className="h-3.5 w-3.5" /> Live Model Artifact Telemetry:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="rounded border border-slate-800 bg-slate-900/70 p-3 space-y-1">
                <div className="text-indigo-300 font-semibold">Project 1: Product Classifier</div>
                <div>Status: <span className="text-emerald-400">{models?.project1.status || "VERIFIED"}</span></div>
                <div>Type: {models?.project1.model_type || "LogisticRegression"}</div>
                <div>Accuracy: 86.51% | Macro F1: 79.30% | Weighted F1: 86.32%</div>
              </div>

              <div className="rounded border border-slate-800 bg-slate-900/70 p-3 space-y-1">
                <div className="text-amber-300 font-semibold">Project 2: Triage Regressor</div>
                <div>Status: <span className="text-amber-400">{models?.project2.status || "EXPERIMENTAL"}</span></div>
                <div>Autonomous Allowed: <span className="text-rose-400">FALSE</span></div>
                <div>Model MAE: 0.4512 days vs Baseline: 0.1764 days (R²: -0.2757)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
