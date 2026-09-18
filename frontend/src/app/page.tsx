"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Tag,
  Clock,
  Layers,
  ArrowRight,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getHealth, getReadiness, getModels } from "@/lib/api/system";
import { ModelsResponse, HealthResponse, ReadyResponse } from "@/types/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ready, setReady] = useState<ReadyResponse | null>(null);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSystemStatus() {
      try {
        const [healthRes, readyRes, modelsRes] = await Promise.allSettled([
          getHealth(),
          getReadiness(),
          getModels(),
        ]);

        if (healthRes.status === "fulfilled") setHealth(healthRes.value);
        if (readyRes.status === "fulfilled") setReady(readyRes.value);
        if (modelsRes.status === "fulfilled") setModels(modelsRes.value);
      } finally {
        setLoading(false);
      }
    }
    loadSystemStatus();
  }, []);

  return (
    <div className="space-y-8">
      {/* Executive Intro Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Machine Learning Operations Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Consumer Complaint Intelligence Platform
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              An enterprise inference gateway interfacing with scikit-learn models trained on Consumer Financial Protection Bureau (CFPB) complaint data. Provides high-throughput multi-class product categorization and intake triage latency estimation.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/combined-analysis"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Run Combined Inference
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live System & Models Telemetry Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* API Health */}
        <Card className="border-slate-800 bg-slate-950/70">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                API Service Health
              </span>
              <Server className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="mt-1 text-lg">
              {loading ? (
                <Skeleton className="h-6 w-24" />
              ) : health?.status === "healthy" ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Healthy
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Offline
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400">
            {ready?.status === "ready"
              ? "All ML model artifacts loaded & ready"
              : health?.service || "CFPB Complaint Intelligence API"}
          </CardContent>
        </Card>

        {/* Project 1 Model Status */}
        <Card className="border-slate-800 bg-slate-950/70">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Project 1: Product Model
              </span>
              <Tag className="h-4 w-4 text-indigo-400" />
            </div>
            <CardTitle className="mt-1 text-lg flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <>
                  <span className="text-slate-100 text-base truncate">
                    {models?.project1.model_type || "TF-IDF Classifier"}
                  </span>
                  <StatusBadge
                    status={models?.project1.status || "verified"}
                    variant="success"
                  />
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 font-mono">
            {models?.project1.version ? `v${models.project1.version}` : "Status: Active"}
          </CardContent>
        </Card>

        {/* Project 2 Model Status */}
        <Card className="border-slate-800 bg-slate-950/70">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Project 2: Triage Model
              </span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <CardTitle className="mt-1 text-lg flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <>
                  <span className="text-slate-100 text-base truncate">
                    {models?.project2.model_type || "Latency Regressor"}
                  </span>
                  <StatusBadge
                    status={models?.project2.status || "experimental"}
                    variant="warning"
                  />
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 font-mono">
            Autonomous Decisions: PROHIBITED
          </CardContent>
        </Card>
      </div>

      {/* Machine Learning Capabilities Overview */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Production Inference Capabilities
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Capability 1: Product Classification */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <Tag className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Product Classification (Project 1)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates narrative linguistic tokens and identified financial institution entities to classify consumer complaints across primary CFPB categories (Credit reporting, Mortgages, Debt collection, Student loans).
              </p>
            </div>

            <Link
              href="/product-classification"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Launch Classifier <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Capability 2: Triage Latency Intelligence */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Triage Latency Intelligence (Project 2)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estimates intake-to-resolution delay in days and hours, grouping submissions into operational risk bands. Tagged with mandatory experimental safeguards to prevent autonomous escalation.
              </p>
            </div>

            <Link
              href="/triage-intelligence"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              Launch Triage Predictor <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Capability 3: Combined Analysis */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Combined Analysis Pipeline
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A single unified intake endpoint dispatching complaint details concurrently to both models. Delivers synchronized categorization and latency forecasting in one analytical view.
              </p>
            </div>

            <Link
              href="/combined-analysis"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              Launch Unified Intake <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Architecture & Governance Specification */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            System Architecture & Execution Flow
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              1. Intake & Validation Layer
            </span>
            <p className="text-slate-400 leading-relaxed">
              Client requests undergo strict schema validation via Zod on the frontend and FastAPI Pydantic on the backend, enforcing 10–20,000 character narrative limits.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              2. Independent Scikit-Learn Workers
            </span>
            <p className="text-slate-400 leading-relaxed">
              FastAPI services invoke preloaded artifact pipelines. Project 1 generates calibrated probability distributions; Project 2 computes regression turnaround estimates.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              3. Operational Guardrails
            </span>
            <p className="text-slate-400 leading-relaxed">
              Outputs include confidence ratings, operational risk bands, and mandatory disclaimers prohibiting autonomous resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
