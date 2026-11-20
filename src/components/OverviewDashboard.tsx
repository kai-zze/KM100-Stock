import React from 'react';
import { Plus, ChevronRight, AlertTriangle, Building } from 'lucide-react';
import { Room, InventoryItem } from '../types/inventory';
import { isNeedsAttention } from '../utils/status';

interface Props {
  rooms: Room[];
  items: InventoryItem[];
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  onSelectRoom: (roomId: string) => void;
  onAddItem: () => void;
}

export const OverviewDashboard: React.FC<Props> = ({
  rooms,
  items,
  roomItemCounts,
  onSelectRoom,
  onAddItem
}) => {
  return (
    <div className="px-4 lg:px-6 py-6 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Institutional Overview
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Consolidated training equipment and physical asset portfolio
            </p>
          </div>

          <button
            onClick={onAddItem}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98]"
          >
            <Plus size={16} /> Add Inventory Item
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Facility Breakdown by Room
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-300">Select a facility to inspect</span>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Building size={22} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No facilities yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                Add a facility room from the sidebar to start tracking its inventory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {rooms.map(room => {
                const counts = roomItemCounts[room.id] || { unique: 0, totalQty: 0 };
                const rItems = items.filter(i => i.roomId === room.id);
                const needsAttentionCount = rItems.filter(isNeedsAttention).length;

                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate">
                        {room.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-1 mb-3">
                      {room.description || 'Facility room'}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                      <span className="text-slate-500 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">{counts.unique}</strong> items
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        <strong className="text-emerald-700 dark:text-emerald-300">{counts.totalQty}</strong> units
                      </span>
                    </div>

                    {needsAttentionCount > 0 && (
                      <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle size={11} /> {needsAttentionCount} item
                        {needsAttentionCount === 1 ? '' : 's'} need attention
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
