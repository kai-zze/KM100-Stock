import React from 'react';
import { Trash2, X } from 'lucide-react';
import { Room } from '../types/inventory';
import { STATUS_OPTIONS } from '../utils/status';

interface Props {
  count: number;
  rooms: Room[];
  onClear: () => void;
  onMove: (roomId: string) => void;
  onSetStatus: (status: string) => void;
  onDelete: () => void;
}

export const BulkActionBar: React.FC<Props> = ({
  count,
  rooms,
  onClear,
  onMove,
  onSetStatus,
  onDelete
}) => {
  if (count === 0) return null;

  return (
    <div
      className="floating-bar fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-24px)] sm:w-max max-w-[96vw] bg-slate-900/95 backdrop-blur-md text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] px-4 py-2 rounded-2xl border border-slate-700/90 flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 sm:gap-4 animate-modal text-xs ring-1 ring-white/10 no-print"
      role="toolbar"
      aria-label="Bulk actions for selected inventory items"
    >
      <div className="flex items-center gap-2 pr-3 sm:border-r border-slate-700/80 shrink-0">
        <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-mono font-bold text-xs shadow-sm">
          {count}
        </span>
        <span className="font-semibold">Selected</span>
        <button
          onClick={onClear}
          className="ml-1 px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
          title="Clear selection (Esc)"
        >
          <X size={11} /> Clear
        </button>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <label className="text-[11px] text-slate-400 font-medium shrink-0" htmlFor="bulk-move">
          Move:
        </label>
        <select
          id="bulk-move"
          defaultValue=""
          onChange={(e) => {
            const value = e.target.value;
            e.target.value = '';
            if (value) onMove(value);
          }}
          className="bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer shadow-inner max-w-[120px] sm:max-w-none"
        >
          <option value="">Choose Room...</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <label className="text-[11px] text-slate-400 font-medium shrink-0" htmlFor="bulk-status">
          Status:
        </label>
        <select
          id="bulk-status"
          defaultValue=""
          onChange={(e) => {
            const value = e.target.value;
            e.target.value = '';
            if (value) onSetStatus(value);
          }}
          className="bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer shadow-inner max-w-[120px] sm:max-w-none"
        >
          <option value="">Set Status...</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 pl-0 sm:pl-3 sm:border-l border-slate-700/80 shrink-0 sm:ml-1">
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-900/40 transition-all"
          title={`Delete ${count} selected items`}
        >
          <Trash2 size={14} />
          <span>Delete ({count})</span>
        </button>
      </div>
    </div>
  );
};
