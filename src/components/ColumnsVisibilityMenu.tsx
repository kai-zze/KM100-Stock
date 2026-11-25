import React, { useState, useRef, useEffect } from "react";
import { Eye, ChevronDown, Sliders } from "lucide-react";
import { ColumnDefinition } from "../types/inventory";

interface Props {
  columns: ColumnDefinition[];
  hiddenColumnIds: string[];
  onToggleColumn: (columnId: string) => void;
  onOpenSchemaBuilder?: () => void;
}

/** Quick show/hide menu for table columns, independent of the schema builder. */
export const ColumnsVisibilityMenu: React.FC<Props> = ({
  columns,
  hiddenColumnIds,
  onToggleColumn,
  onOpenSchemaBuilder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleCount = columns.filter(
    (col) => hiddenColumnIds.indexOf(col.id) === -1,
  ).length;

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block z-30 w-full md:w-auto" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full justify-center md:w-auto flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
        title="Visible columns"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Eye
          size={14}
          className="text-slate-500 dark:text-slate-400 shrink-0"
        />
        <span className="truncate">Columns</span>
        <ChevronDown size={12} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Visible columns menu"
          className="absolute right-0 mt-1 w-[min(16rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-xs sm:text-sm animate-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2 font-medium text-slate-500 dark:text-slate-400 text-xs border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold">Visible columns</span>
            <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded font-bold tabular-nums">
              {visibleCount} / {columns.length}
            </span>
          </div>

          {/* Column Toggles List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {columns.map((column) => {
              const isVisible = hiddenColumnIds.indexOf(column.id) === -1;
              const isLastVisible = isVisible && visibleCount <= 1;
              return (
                <label
                  key={column.id}
                  className={`flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 select-none text-slate-700 dark:text-slate-300 transition-colors ${
                    isLastVisible
                      ? "opacity-75 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      disabled={isLastVisible}
                      onChange={() => {
                        if (!isLastVisible) onToggleColumn(column.id);
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span
                      className={`truncate text-xs sm:text-sm ${
                        isVisible
                          ? "font-medium text-slate-800 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-500 line-through"
                      }`}
                    >
                      {column.label}
                    </span>
                  </div>
                  {column.isSystem && (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                      sys
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Footer Action (Admin Only) */}
          {onOpenSchemaBuilder && (
            <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSchemaBuilder();
                }}
                className="w-full text-amber-700 dark:text-amber-400 font-semibold hover:text-amber-800 dark:hover:text-amber-300 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
              >
                <Sliders size={14} />
                <span>Customize columns</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ColumnsVisibilityMenu.displayName = "ColumnsVisibilityMenu";
