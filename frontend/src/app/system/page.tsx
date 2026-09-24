"use client";

import { useEffect, useState, useCallback } from "react";
import { Server, RefreshCw, CheckCircle2, AlertTriangle, Cpu, Globe, Database, BookOpen } from "lucide-react";
import Link from "next/link";
import { getHealth, getReadiness, getModels } from "@/lib/api/system";
import { getApiBaseUrl } from "@/lib/api/client";
import { HealthResponse, ReadyResponse, ModelsResponse } from "@/types/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModelCard } from "@/components/system/model-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SystemPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ready, setReady] = useState<ReadyResponse | null>(null);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchSystemTelemetry = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [healthData, readyData, modelsData] = await Promise.all([
        getHealth(),
        getReadiness(),
        getModels(),
      ]);

      setHealth(healthData);
      setReady(readyData);
      setModels(modelsData);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load system metadata.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemTelemetry();
  }, [fetchSystemTelemetry]);

  const apiBaseUrl = getApiBaseUrl();

  return (
    <div className="space-y-6">
      {/* Header & Refresh Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            System Architecture & Model Artifacts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry gathered directly from FastAPI `/health`, `/ready`, and `/models` endpoints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>View Methodology</span>
          </Link>

          {lastRefreshed && (
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Updated: {lastRefreshed}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemTelemetry}
            isLoading={loading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-4 text-xs text-rose-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Unable to connect to inference server
          </div>
          <p className="mt-1 text-slate-300">{error}</p>
        </div>
      )}

      {/* Platform Infrastructure Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Endpoint & Connectivity */}
        <Card className="border-slate-800 bg-slate-950/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Backend Host
              </span>
              <Globe className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="text-sm font-mono text-slate-200 truncate mt-1">
              {apiBaseUrl}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400">
            CORS origin whitelist enforced
          </CardContent>
        </Card>

        {/* Health Check */}
        <Card className="border-slate-800 bg-slate-950/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Liveness Probe (/health)
              </span>
              <Server className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="text-sm mt-1">
              {loading ? (
                <Skeleton className="h-5 w-24" />
              ) : health?.status === "healthy" ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="h-4 w-4" /> HEALTHY
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="h-4 w-4" /> UNHEALTHY
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400">
            {health?.service || "FastAPI Gateway"}
          </CardContent>
        </Card>

        {/* Readiness Probe */}
        <Card className="border-slate-800 bg-slate-950/70">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Readiness Probe (/ready)
              </span>
              <Database className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="text-sm mt-1">
              {loading ? (
                <Skeleton className="h-5 w-24" />
              ) : ready?.status === "ready" ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="h-4 w-4" /> MODELS LOADED
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="h-4 w-4" /> NOT READY
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-400">
            Memory-mapped artifacts ready for prediction
          </CardContent>
        </Card>
      </div>

      {/* Model Artifacts & Evaluation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Registered Model Artifacts & Evaluation Telemetry
          </h3>
        </div>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </Card>
            <Card className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </Card>
          </div>
        )}

        {!loading && models && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Project 1 Model Card */}
            <ModelCard
              title="Project 1: Product Classification"
              projectId="project1"
              info={models.project1}
            />

            {/* Project 2 Model Card */}
            <ModelCard
              title="Project 2: Triage Latency Prediction"
              projectId="project2"
              info={models.project2}
            />
          </div>
        )}
      </div>
    </div>
  );
}
