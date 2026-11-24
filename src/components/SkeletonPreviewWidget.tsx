import React, { useState, useEffect } from "react";
import {
  Sparkles,
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  Shield,
  X,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import {
  AppShellSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  ModalSkeleton,
} from "./SkeletonLoader";

export type SkeletonPreviewMode =
  "none" | "shell" | "dashboard" | "table" | "modal";

interface Props {
  previewMode: SkeletonPreviewMode;
  onSelectMode: (mode: SkeletonPreviewMode) => void;
  onSimulateLoad: (durationMs?: number) => void;
}

export const SkeletonPreviewWidget: React.FC<Props> = ({
  previewMode,
  onSelectMode,
  onSimulateLoad,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewMode !== "none") {
          onSelectMode("none");
        }
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewMode, onSelectMode]);

  return (
    <>
      {/* ── Active Skeleton Screen Overlays ─────────────────────────── */}
      {previewMode === "shell" && <AppShellSkeleton />}

      {previewMode === "dashboard" && (
        <div className="fixed inset-0 z-[9000] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pt-12">
            <DashboardSkeleton />
          </div>
        </div>
      )}

      {previewMode === "table" && (
        <div className="fixed inset-0 z-[9000] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pt-12">
            <TableSkeleton rows={9} />
          </div>
        </div>
      )}

      {previewMode === "modal" && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <ModalSkeleton size="lg" />
        </div>
      )}

      {/* ── Floating Dev/Preview Control Bar (Always accessible on top) ── */}
      <div className="fixed bottom-4 left-4 z-[9999] select-none font-sans print:hidden">
        {isOpen ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 w-72 sm:w-80 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Sparkles
                  size={14}
                  className="text-amber-600 dark:text-amber-400"
                />
                <span>Skeleton Loader Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close preview menu"
              >
                <X size={15} />
              </button>
            </div>

            {/* Screen Options */}
            <div className="space-y-1 pt-1">
              <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Test Screens
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectMode("shell");
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  previewMode === "shell"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard
                    size={14}
                    className="text-amber-700 dark:text-amber-400"
                  />
                  Full App Shell
                </span>
                <span className="text-[10px] text-slate-400">Header + Nav</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectMode("dashboard");
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  previewMode === "dashboard"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers
                    size={14}
                    className="text-amber-700 dark:text-amber-400"
                  />
                  Dashboard &amp; Rooms Grid
                </span>
                <span className="text-[10px] text-slate-400">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectMode("table");
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  previewMode === "table"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet
                    size={14}
                    className="text-amber-700 dark:text-amber-400"
                  />
                  Inventory Data Table
                </span>
                <span className="text-[10px] text-slate-400">Data Grid</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectMode("modal");
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  previewMode === "modal"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield
                    size={14}
                    className="text-amber-700 dark:text-amber-400"
                  />
                  Modal Dialog Wireframe
                </span>
                <span className="text-[10px] text-slate-400">Dialog</span>
              </button>
            </div>

            {/* Live Simulation Action */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  onSelectMode("none");
                  onSimulateLoad(3000);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowRight size={13} />
                <span>Simulate 3s Network Delay</span>
              </button>

              {previewMode !== "none" && (
                <button
                  type="button"
                  onClick={() => onSelectMode("none")}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Exit Skeleton Preview</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl border transition-all cursor-pointer text-xs font-semibold ${
              previewMode !== "none"
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-500 ring-4 ring-amber-500/25"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 border-slate-200/90 dark:border-slate-800 ring-1 ring-slate-900/5 hover:scale-105 active:scale-95"
            }`}
            title="Preview and test skeleton loaders across all screen states"
            aria-label="Test skeleton loaders"
          >
            <Sparkles size={15} className="text-amber-500 animate-pulse" />
            <span>
              {previewMode !== "none"
                ? `Previewing: ${previewMode}`
                : "Test Skeletons"}
            </span>
            {previewMode !== "none" && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMode("none");
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-black/20"
                title="Exit preview"
              >
                <X size={12} />
              </span>
            )}
          </button>
        )}
      </div>
    </>
  );
};
