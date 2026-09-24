"use client";

import {
  BookOpen,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Cpu,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
          Platform Methodology & Governance Manual
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          About the CFPB Complaint Intelligence Platform
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          An end-to-end machine learning system designed to analyze unstructured financial consumer grievances, predict regulatory product categories, and evaluate intake triage latency within enterprise compliance workflows.
        </p>
      </div>

      {/* Core Principle Callout */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Fundamental Governance Principle: Prediction ≠ Decision
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Machine learning models output probabilistic estimates and statistical predictions based on historical patterns. In high-stakes regulatory compliance and consumer finance workflows, a model inference must never be mistaken for an autonomous business decision or verified ground truth.
            </p>
          </div>
        </div>
      </div>

      {/* Section Grid / Table of Contents */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        {/* 1. Project Overview & 2. Business Problem */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">01.</span> Project Overview & Business Problem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-slate-800 bg-slate-950/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-indigo-300">Project Mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-400 text-xs">
                <p>
                  The CFPB Complaint Intelligence Platform automates the ingestion, classification, and triage routing assessment of consumer financial disputes filed across US financial institutions.
                </p>
                <p>
                  It demonstrates enterprise MLOps architecture: frozen scikit-learn artifacts served via a high-throughput FastAPI backend with a modern Next.js client.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-300">The Business Problem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-400 text-xs">
                <p>
                  Financial institutions and regulatory portals receive hundreds of thousands of unstructured narratives annually. Manual triage creates operational bottlenecks, delays regulatory response times, and risks non-compliance penalties.
                </p>
                <p>
                  Automating initial classification and estimating intake triage latency enables intelligent queue management for human analysts.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Dataset & 4. Prediction Event & 5. Leakage Prevention */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">02.</span> Dataset, Prediction Event & Leakage Prevention
          </h2>
          
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-semibold text-white block mb-1">Public CFPB Database</span>
                <p className="text-slate-400 text-xs">
                  Trained on real public consumer complaints published by the Consumer Financial Protection Bureau. Consumer personal identifiable information (PII) is fully redacted in public releases.
                </p>
              </div>

              <div>
                <span className="font-semibold text-white block mb-1">Point-in-Time Prediction Event</span>
                <p className="text-slate-400 text-xs">
                  The prediction event is defined strictly at <span className="text-indigo-300 font-mono">Date Received</span>. Features available to models are limited to information present at initial complaint intake.
                </p>
              </div>

              <div>
                <span className="font-semibold text-white block mb-1">Data Leakage Prevention</span>
                <p className="text-slate-400 text-xs">
                  Post-intake features (company response status, closure date, consumer dispute outcome, subsequent correspondence) are strictly excluded from model feature matrices to prevent target leakage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Project 1 Methodology & 7. Project 1 Evaluation */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">03.</span> Project 1: Multi-Class Product Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300">Methodology & Feature Pipeline</span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 font-mono">
                  VERIFIED
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li><strong>Task:</strong> Multi-class text categorization across CFPB primary product domains.</li>
                <li><strong>Model:</strong> Multinomial Logistic Regression classifier.</li>
                <li><strong>Text Features:</strong> Dual Word TF-IDF and Character n-gram TF-IDF vectorizers.</li>
                <li><strong>Entity Features:</strong> Target company categorical encoding via OneHotEncoder.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <span className="font-semibold text-emerald-300">Holdout Test Evaluation Metrics</span>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                <div className="rounded bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Test Accuracy</div>
                  <div className="text-sm font-bold text-white">86.51%</div>
                </div>
                <div className="rounded bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Macro F1</div>
                  <div className="text-sm font-bold text-indigo-400">79.30%</div>
                </div>
                <div className="rounded bg-slate-900 p-2 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Weighted F1</div>
                  <div className="text-sm font-bold text-emerald-400">86.32%</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Evaluation demonstrated high discriminative performance across high-volume categories with balanced precision-recall trade-offs.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Project 2 Methodology & 9. Baseline Comparison & 10. Why Not Production Approved */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="text-amber-400 font-mono">04.</span> Project 2: Triage Delay & Baseline Comparison
          </h2>

          <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white text-sm">
                  Triage Latency Prediction (Intake-to-Company Routing Delay)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Target: <code className="text-amber-300 font-mono">triage_delay_days = (Date Sent to Company - Date Received)</code>
                </p>
              </div>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 border border-amber-500/20 font-mono">
                EXPERIMENTAL
              </span>
            </div>

            {/* Baseline Comparison Table */}
            <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 bg-slate-900/90 text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Evaluation Metric</th>
                    <th className="p-2.5 text-amber-300">Ridge Regression (Model)</th>
                    <th className="p-2.5 text-emerald-300">Naive Median Baseline</th>
                    <th className="p-2.5">Benchmark Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-300">Mean Absolute Error (MAE)</td>
                    <td className="p-2.5 text-rose-400 font-bold">0.4512 days</td>
                    <td className="p-2.5 text-emerald-400 font-bold">0.1764 days</td>
                    <td className="p-2.5 text-rose-400 font-sans">Baseline is 2.5x more accurate</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-300">Median Absolute Error (MedianAE)</td>
                    <td className="p-2.5 text-rose-400 font-bold">0.1054 days</td>
                    <td className="p-2.5 text-emerald-400 font-bold">0.0056 days</td>
                    <td className="p-2.5 text-rose-400 font-sans">Baseline median error near zero</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-300">Root Mean Squared Error (RMSE)</td>
                    <td className="p-2.5 text-slate-300">1.6663 days</td>
                    <td className="p-2.5 text-slate-300">1.4853 days</td>
                    <td className="p-2.5 text-slate-400 font-sans">Similar tail variance</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-300">Coefficient of Determination (R²)</td>
                    <td className="p-2.5 text-rose-400 font-bold">-0.2757</td>
                    <td className="p-2.5 text-slate-300">-0.0136</td>
                    <td className="p-2.5 text-rose-400 font-sans">Negative R² indicates regression failure</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Why Not Production Approved Explanation */}
            <div className="rounded border border-rose-500/20 bg-rose-950/20 p-3 space-y-1 text-xs">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-400" />
                Why Project 2 is NOT Production Approved
              </span>
              <p className="text-slate-300 leading-relaxed">
                Empirical evaluation proved that standard regression over intake text is dominated by structural operational noise. Because the model produced worse MAE and negative $R^2$ compared to a simple historical median baseline, <strong>it is disqualified from autonomous operational routing</strong>. The model is preserved purely for informational experimentation.
              </p>
            </div>
          </div>
        </section>

        {/* 11. Architecture & 12. Deployment */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">05.</span> System Architecture & Production Deployment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <span className="font-semibold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" />
                Dual-Tier Application Topology
              </span>
              <p className="text-slate-400 text-xs">
                <strong>Next.js Frontend (Vercel):</strong> Client-side rendering, Zod schema validation, real-time character boundary monitoring, and accessible UI components.
              </p>
              <p className="text-slate-400 text-xs">
                <strong>FastAPI Backend (Render):</strong> Containerized Python service loading frozen joblib pipelines into worker memory for sub-100ms inference.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
              <span className="font-semibold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                Security & Data Integrity
              </span>
              <p className="text-slate-400 text-xs">
                CORS isolation strictly restricts API calls to verified Vercel production domains.
              </p>
              <p className="text-slate-400 text-xs">
                Stateless inference pipeline: narratives are processed in-memory for inference and discarded without remote database persistence.
              </p>
            </div>
          </div>
        </section>

        {/* 13. Governance Principles & 14. Limitations & 15. Future Improvements */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">06.</span> Governance, Limitations & Future Work
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
              <span className="font-semibold text-indigo-300">Governance Framework</span>
              <p className="text-slate-400 text-xs leading-relaxed">
                Strict human-in-the-loop requirement. Probabilities are descriptive model likelihoods, not calibrated guarantees. Autonomous decisioning on experimental models is strictly prohibited.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
              <span className="font-semibold text-amber-300">Current Limitations</span>
              <p className="text-slate-400 text-xs leading-relaxed">
                Linear models are subject to vocabulary drift over time as emerging financial products and scams evolve. Extreme skew in intake-to-company forwarding delays limits linear regression predictability.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-1.5">
              <span className="font-semibold text-emerald-300">Future Enhancements</span>
              <p className="text-slate-400 text-xs leading-relaxed">
                Exploring domain-adapted FinBERT embeddings, survival analysis for censored delay intervals, and tree-based gradient boosted classifiers for complex non-linear feature interactions.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Return to Platform CTA */}
      <div className="flex justify-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Try Live Interactive Analysis <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
