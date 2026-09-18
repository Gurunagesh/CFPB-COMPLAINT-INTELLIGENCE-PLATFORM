import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "neutral" | "info";
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, variant = "default", className, pulse = false }: StatusBadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "danger":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "info":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "neutral":
        return "bg-slate-800 text-slate-300 border-slate-700";
      default:
        // Auto-detect based on string value
        const lower = status.toLowerCase();
        if (lower.includes("healthy") || lower.includes("ready") || lower.includes("verified")) {
          return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        }
        if (lower.includes("exp") || lower.includes("uncalibrated") || lower.includes("warning")) {
          return "bg-amber-500/10 text-amber-400 border-amber-500/30";
        }
        if (lower.includes("not_ready") || lower.includes("unhealthy") || lower.includes("error")) {
          return "bg-rose-500/10 text-rose-400 border-rose-500/30";
        }
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase font-mono",
        getStyles(),
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {status}
    </span>
  );
}
