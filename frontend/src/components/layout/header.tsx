"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  RefreshCw,
  Server,
  AlertCircle,
  Clock,
} from "lucide-react";
import { getHealth, getReadiness } from "@/lib/api/system";
import { getApiBaseUrl } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Intelligence Platform Overview",
    subtitle: "Real-time inference architecture and operational status",
  },
  "/product-classification": {
    title: "Product Classification",
    subtitle: "Project 1 • NLP multi-class product categorization",
  },
  "/triage-intelligence": {
    title: "Triage Latency Intelligence",
    subtitle: "Project 2 • Estimated intake latency & operational risk band",
  },
  "/combined-analysis": {
    title: "Combined Inference Analysis",
    subtitle: "Unified intake executing Project 1 & Project 2 simultaneously",
  },
  "/system": {
    title: "System & Model Health",
    subtitle: "Live readiness probes, model artifacts, and evaluation metrics",
  },
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const routeMeta = ROUTE_TITLES[pathname] || {
    title: "CFPB Consumer Complaint Intelligence",
    subtitle: "Machine Learning Inference Portal",
  };

  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const [healthRes, readyRes] = await Promise.allSettled([
        getHealth(),
        getReadiness(),
      ]);

      if (healthRes.status === "fulfilled" && healthRes.value.status === "healthy") {
        setIsHealthy(true);
      } else {
        setIsHealthy(false);
      }

      if (readyRes.status === "fulfilled" && readyRes.value.status === "ready") {
        setIsReady(true);
      } else {
        setIsReady(false);
      }

      const now = new Date();
      setLastChecked(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      setIsHealthy(false);
      setIsReady(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Poll conservatively on mount and every 60 seconds
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const baseUrl = getApiBaseUrl();
  const isProductionBackend = baseUrl.includes("onrender.com");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md lg:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
            {routeMeta.title}
          </h1>
          <p className="hidden text-xs text-slate-400 sm:block">
            {routeMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Environment & Backend Status Indicator */}
      <div className="flex items-center gap-3">
        {/* Environment Badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-mono md:flex">
          <Server className="h-3 w-3 text-slate-400" />
          <span className="text-slate-400">Target:</span>
          <span className={isProductionBackend ? "text-indigo-400 font-semibold" : "text-amber-400 font-semibold"}>
            {isProductionBackend ? "Render (Prod)" : "Localhost:8000"}
          </span>
        </div>

        {/* Live Backend Status */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
          {isHealthy === null ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Probing API...</span>
            </div>
          ) : isHealthy && isReady ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[11px]">API Online & Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="font-medium text-[11px]">API Unreachable</span>
            </div>
          )}

          {/* Manual Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={checkStatus}
            disabled={isChecking}
            className="h-6 w-6 text-slate-400 hover:text-white"
            title={lastChecked ? `Last checked: ${lastChecked}. Click to refresh status.` : "Check backend status"}
            aria-label="Refresh API Status"
          >
            <RefreshCw className={isChecking ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
          </Button>
        </div>
      </div>
    </header>
  );
}
