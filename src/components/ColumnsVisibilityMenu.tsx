import React, { useState } from 'react';
import { Eye, ChevronDown, Sliders } from 'lucide-react';
import { ColumnDefinition } from '../types/inventory';

interface Props {
  columns: ColumnDefinition[];
  hiddenColumnIds: string[];
  onToggleColumn: (columnId: string) => void;
  onOpenSchemaBuilder: () => void;
}

/** Quick show/hide menu for table columns, independent of the schema builder. */
export const ColumnsVisibilityMenu: React.FC<Props> = ({
  columns,
  hiddenColumnIds,
  onToggleColumn,
  onOpenSchemaBuilder
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
        title="Toggle visible columns"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Eye size={14} />
        <span className="hidden sm:inline">Columns</span>
        <ChevronDown size={11} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Toggle columns menu"
          className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-modal"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-1 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
            Toggle Table Columns
          </div>

          {columns.map((column) => {
            const isVisible = hiddenColumnIds.indexOf(column.id) === -1;
            return (
              <label
                key={column.id}
                role="menuitemcheckbox"
                aria-checked={isVisible}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer select-none text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleColumn(column.id)}
                  className="rounded border-slate-300 text-amber-700 focus:ring-amber-600"
                />
                <span className={isVisible ? 'font-medium' : 'text-slate-400 line-through'}>
                  {column.label}
                </span>
              </label>
            );
          })}

          <div className="pt-1.5 px-3 border-t border-slate-100 mt-1 text-[11px]">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSchemaBuilder();
              }}
              className="text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Sliders size={12} /> Customize Schema Builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
