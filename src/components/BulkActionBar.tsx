import React from "react";
import {
  Trash2,
  X,
  ArrowRight,
  Tag,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { Room } from "../types/inventory";
import { STATUS_OPTIONS } from "../utils/status";

interface Props {
  count: number;
  rooms: Room[];
  onClear: () => void;
  onMove: (roomId: string) => void;
  onSetStatus: (status: string) => void;
  onExportExcel?: () => void;
  onDelete: () => void;
}

export const BulkActionBar: React.FC<Props> = React.memo(
  ({ count, rooms, onClear, onMove, onSetStatus, onExportExcel, onDelete }) => {
    if (count === 0) return null;

    return (
      <div
        className="mb-3 animate-slide-down bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-2.5 sm:px-5 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs no-print"
        role="toolbar"
        aria-label="Bulk actions for selected inventory items"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-700 text-white font-bold text-xs tabular-nums shadow-sm">
            <CheckCircle2 size={13} />
            {count} Selected
          </span>
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium transition-colors"
            title="Clear selection (Esc)"
          >
            Deselect all
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <ArrowRight
              size={14}
              className="text-amber-700 dark:text-amber-400 shrink-0"
            />
            <span className="text-xs font-semibold text-slate-500">
              Move to:
            </span>
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                e.target.value = "";
                if (val) onMove(val);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none truncate"
            >
              <option value="">Choose Room...</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Tag
              size={14}
              className="text-amber-700 dark:text-amber-400 shrink-0"
            />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              Status:
            </span>
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                e.target.value = "";
                if (val) onSetStatus(val);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">Set Status...</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              title="Export selected items to Excel"
            >
              <FileSpreadsheet size={13} />
              <span className="hidden sm:inline">Export Selected</span>
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            title={`Delete ${count} selected items`}
          >
            <Trash2 size={13} />
            <span>Delete ({count})</span>
          </button>

          <button
            onClick={onClear}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            title="Dismiss selection"
            aria-label="Dismiss selection"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  },
);

BulkActionBar.displayName = "BulkActionBar";
