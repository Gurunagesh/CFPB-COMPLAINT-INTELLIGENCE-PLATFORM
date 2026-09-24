"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface DevModeContextType {
  isDevMode: boolean;
  toggleDevMode: () => void;
  setDevMode: (value: boolean) => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

const STORAGE_KEY = "cfpb_intel_dev_mode";

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevModeState] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check URL parameters for ?mode=dev or ?debug=true
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "dev" || params.get("debug") === "true") {
        setIsDevModeState(true);
        localStorage.setItem(STORAGE_KEY, "true");
        return;
      }

      // Check localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsDevModeState(saved === "true");
      }
    }
  }, []);

  const setDevMode = useCallback((value: boolean) => {
    setIsDevModeState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  }, []);

  const toggleDevMode = useCallback(() => {
    setIsDevModeState((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  // Keyboard shortcut listener: Ctrl+Shift+D or Cmd+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        toggleDevMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleDevMode]);

  return (
    <DevModeContext.Provider value={{ isDevMode: mounted ? isDevMode : false, toggleDevMode, setDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode(): DevModeContextType {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevMode must be used within a DevModeProvider");
  }
  return context;
}
