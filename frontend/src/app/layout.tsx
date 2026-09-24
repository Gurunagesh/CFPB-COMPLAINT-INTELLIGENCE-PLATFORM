"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DevModeProvider } from "@/lib/context/dev-mode-context";
import { ToastProvider } from "@/lib/context/toast-context";
import { ThemeProvider } from "@/lib/context/theme-context";
import { cn } from "@/lib/utils";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>CFPB Consumer Complaint Intelligence Platform</title>
        <meta
          name="description"
          content="Production inference portal for CFPB consumer financial complaint product classification and intake triage latency forecasting."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <DevModeProvider>
            <ToastProvider>
              <div className="flex min-h-screen w-full">
                {/* Sidebar Navigation */}
                <Sidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main Content Area with dynamic left padding */}
                <div
                  className={cn(
                    "flex flex-1 flex-col transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
                  )}
                >
                  <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                  <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                  </main>
                </div>
              </div>
            </ToastProvider>
          </DevModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
