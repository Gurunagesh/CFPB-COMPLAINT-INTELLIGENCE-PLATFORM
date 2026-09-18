"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Clock,
  Layers,
  Server,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "System Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Product Classification",
    href: "/product-classification",
    icon: Tag,
    badge: "P1",
  },
  {
    name: "Triage Intelligence",
    href: "/triage-intelligence",
    icon: Clock,
    badge: "P2",
  },
  {
    name: "Combined Analysis",
    href: "/combined-analysis",
    icon: Layers,
    badge: "Unified",
  },
  {
    name: "System & Models",
    href: "/system",
    icon: Server,
    badge: null,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Title */}
        <div className="flex items-center gap-3 px-2 pb-5 border-b border-slate-800/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
              CFPB Intelligence
            </h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide">
              Risk & Inference Ops
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 flex-1 space-y-1.5" aria-label="Main Navigation">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Inference Services
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-mono",
                      isActive
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Operational Guardrails Footer */}
        <div className="border-t border-slate-800/80 pt-4 px-2">
          <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              ML Governance Notice
            </div>
            <p className="leading-normal text-slate-400 text-[10px]">
              Predictions are statistical approximations for decision-support only. Autonomous action is prohibited.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="font-mono">v1.0.0</span>
            <a
              href="https://www.consumerfinance.gov/data-research/consumer-complaints/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 inline-flex items-center gap-1 text-[10px]"
            >
              CFPB Source <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
