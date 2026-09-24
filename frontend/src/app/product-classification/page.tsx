"use client";

import { useState } from "react";
import { Tag, Send, RotateCcw, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { predictProduct } from "@/lib/api/project1";
import { ApiError } from "@/lib/api/client";
import { ProductPredictionResponse } from "@/types/api";
import { productPredictionSchema } from "@/lib/validation/schemas";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SamplePicker } from "@/components/forms/sample-picker";
import { CharacterCounter } from "@/components/forms/character-counter";
import { ProductResultCard } from "@/components/prediction/product-result-card";
import { SampleComplaint } from "@/lib/samples";
import { useToast } from "@/lib/context/toast-context";

export default function ProductClassificationPage() {
  const { toast } = useToast();
  const [narrative, setNarrative] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [result, setResult] = useState<ProductPredictionResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleSelectSample = (sample: SampleComplaint) => {
    setNarrative(sample.narrative);
    setCompany(sample.company);
    setSelectedSampleId(sample.id);
    setValidationError(null);
    setApiError(null);
  };

  const handleClear = () => {
    setNarrative("");
    setCompany("");
    setSelectedSampleId(null);
    setResult(null);
    setValidationError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const validation = productPredictionSchema.safeParse({ narrative, company });
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Validation failed";
      setValidationError(firstError);
      return;
    }

    setLoading(true);
    const warmupTimer = setTimeout(() => setIsWarmingUp(true), 3500);

    try {
      const res = await predictProduct({
        narrative: validation.data.narrative,
        company: validation.data.company,
      });
      setResult(res);
      toast.success("Classification Complete", `Predicted: ${res.predicted_product}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("Failed to communicate with prediction service.");
      }
      toast.error("Prediction Failed", "Unable to complete classification.");
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
          Product Classification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Project 1 • Automated financial product classification based on consumer grievance narrative and company entity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-800 bg-slate-950/70">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-400" />
                  <CardTitle>Complaint Intake Details</CardTitle>
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
                Provide the full consumer narrative and target company as logged in the CFPB registry.
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
                    Financial Institution / Company <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    required
                    placeholder="e.g. EQUIFAX, INC. or JPMORGAN CHASE & CO."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-500">
                    Min 2 characters, max 500 characters
                  </span>
                </div>

                {/* Narrative Textarea */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="narrative"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Consumer Complaint Narrative <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    id="narrative"
                    rows={7}
                    required
                    placeholder="Enter full consumer grievance narrative..."
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 leading-relaxed font-sans"
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
                      <AlertTriangle className="h-4 w-4" /> Classification Service Notice
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
                  <div className="flex items-center gap-2.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-3 text-xs text-indigo-300 animate-pulse">
                    <Clock className="h-4 w-4 shrink-0 text-indigo-400 animate-spin" />
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
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {loading ? "Classifying Complaint Narrative..." : "Run Product Classification"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <ProductResultCard
              result={result}
              narrative={narrative}
              company={company}
            />
          ) : (
            <Card className="border-slate-800 bg-slate-950/40 p-6 flex flex-col items-center justify-center text-center min-h-[360px] space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
                <Tag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Awaiting Classification Intake</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Enter a consumer complaint narrative and company name to predict the primary financial product category and class probabilities.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
