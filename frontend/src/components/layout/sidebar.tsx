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
  BookOpen,
  Terminal,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDevMode } from "@/lib/context/dev-mode-context";
import { useTheme } from "@/lib/context/theme-context";

const NAV_ITEMS = [
  {
    name: "Platform Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Product Classification",
    href: "/product-classification",
    icon: Tag,
  },
  {
    name: "Triage Intelligence",
    href: "/triage-intelligence",
    icon: Clock,
  },
  {
    name: "Combined Analysis",
    href: "/combined-analysis",
    icon: Layers,
  },
  {
    name: "System & Models",
    href: "/system",
    icon: Server,
  },
  {
    name: "About & Methodology",
    href: "/about",
    icon: BookOpen,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { isDevMode, toggleDevMode } = useDevMode();
  const { theme, toggleTheme } = useTheme();

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
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20 px-2.5 py-4" : "lg:w-72 px-4 py-5",
          isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand / Title & Minimize Toggle */}
        <div
          className={cn(
            "flex items-center pb-4 border-b border-slate-800/80",
            isCollapsed ? "justify-center" : "justify-between px-2"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                    CFPB Intelligence
                  </h1>
                  <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300 font-semibold">
                    v1.0.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-wide truncate">
                  ML Inference Platform
                </p>
              </div>
            )}
          </div>

          {/* Desktop Minimize / Collapse Button */}
          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
              title="Minimize Sidebar"
              aria-label="Minimize Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger on top when collapsed */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden lg:flex justify-center pt-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
          {!isCollapsed && (
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Inference Services
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "group flex items-center rounded-lg text-xs font-medium transition-colors",
                  isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer: Dev Mode, CFPB Data Source, and Theme Switch */}
        <div className="border-t border-slate-800/80 pt-3 space-y-2">
          {/* Developer Mode Switch */}
          <button
            type="button"
            onClick={toggleDevMode}
            title={isCollapsed ? `Developer Mode: ${isDevMode ? "ON" : "OFF"}` : undefined}
            className={cn(
              "flex w-full items-center rounded-lg border border-slate-800 bg-slate-900/50 p-2 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-colors",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              {!isCollapsed && (
                <span className="font-sans font-medium text-[11px]">Developer Mode</span>
              )}
            </div>
            {!isCollapsed && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
                  isDevMode
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isDevMode ? "ON" : "OFF"}
              </span>
            )}
          </button>

          {/* CFPB Source Link (Replaces shortcut text) */}
          <a
            href="https://www.consumerfinance.gov/data-research/consumer-complaints/"
            target="_blank"
            rel="noopener noreferrer"
            title={isCollapsed ? "CFPB Complaint Database Source" : undefined}
            className={cn(
              "flex items-center rounded-lg border border-slate-800/60 bg-slate-900/30 p-2 text-[11px] text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">CFPB Data Source</span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] font-mono text-slate-500">gov</span>
            )}
          </a>

          {/* Theme Black/White Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isCollapsed ? `Current Theme: ${theme === "dark" ? "Dark" : "Light"}` : undefined}
            className={cn(
              "flex w-full items-center rounded-lg border border-slate-800 bg-slate-900/50 p-2 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              )}
              {!isCollapsed && (
                <span className="font-sans font-medium text-[11px]">
                  Theme: {theme === "dark" ? "Dark (Slate)" : "Light"}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
