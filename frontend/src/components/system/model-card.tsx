import { Cpu, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { Project1ModelInfo, Project2ModelInfo } from "@/types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/layout/status-badge";

interface ModelCardProps {
  title: string;
  projectId: "project1" | "project2";
  info: Project1ModelInfo | Project2ModelInfo;
}

export function ModelCard({ title, projectId, info }: ModelCardProps) {
  const isP2 = projectId === "project2";
  const p2Info = isP2 ? (info as Project2ModelInfo) : null;

  return (
    <Card className="border-slate-800 bg-slate-950/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{info.name}</CardDescription>
        </div>
        <StatusBadge
          status={info.status || "active"}
          variant={info.status === "verified" ? "success" : "warning"}
        />
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div className="rounded border border-slate-800/80 bg-slate-900/40 p-2.5">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Algorithm / Type</span>
            <p className="mt-1 font-semibold text-slate-200 truncate">
              {info.model_type || "TF-IDF + Linear Classifier"}
            </p>
          </div>

          <div className="rounded border border-slate-800/80 bg-slate-900/40 p-2.5">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Artifact Version</span>
            <p className="mt-1 font-mono font-medium text-indigo-300 truncate">
              {info.version || "1.0.0"}
            </p>
          </div>

          <div className="rounded border border-slate-800/80 bg-slate-900/40 p-2.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-slate-400 font-mono">Target Variable</span>
            <p className="mt-1 font-mono text-slate-200 truncate">
              {info.target || "N/A"}
            </p>
          </div>
        </div>

        {/* Task & Artifact Identity */}
        <div className="space-y-2 rounded border border-slate-800/60 bg-slate-900/20 p-3 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Task:</span>
            <span className="text-slate-300">{info.task || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Artifact:</span>
            <span className="text-slate-300 truncate max-w-[240px]">
              {info.artifact_name || "Embedded in container"}
            </span>
          </div>
        </div>

        {/* Governance & Safety Flags (Project 2 Specific) */}
        {p2Info && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3 text-xs space-y-2">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              Governance & Operational Controls
            </span>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Autonomous Decisioning Allowed:</span>
                <span
                  className={`inline-flex items-center gap-1 font-mono font-semibold ${
                    p2Info.autonomous_decision_allowed ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {p2Info.autonomous_decision_allowed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> ALLOWED
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" /> PROHIBITED
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Baseline Evaluation Required:</span>
                <span className="font-mono text-slate-300">
                  {p2Info.baseline_required ? "YES (Mandatory)" : "NO"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Test Performance Metrics Table */}
        {info.test_metrics && Object.keys(info.test_metrics).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Validated Test Set Metrics</span>
            </div>

            <div className="overflow-x-auto rounded border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Metric</th>
                    <th className="py-2 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {Object.entries(info.test_metrics).map(([key, val]) => {
                    const formattedVal =
                      typeof val === "number"
                        ? val < 1 && val > 0
                          ? (val * 100).toFixed(2) + "%"
                          : val.toFixed(4)
                        : typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val);

                    return (
                      <tr key={key} className="hover:bg-slate-900/40">
                        <td className="py-1.5 px-3 text-slate-400">{key}</td>
                        <td className="py-1.5 px-3 text-right font-medium text-slate-200">
                          {formattedVal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
