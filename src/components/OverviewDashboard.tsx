import React from 'react';
import { Building, Package, Layers, ShieldCheck, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import { Room, InventoryItem } from '../types/inventory';

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
  const totalRooms = rooms.length;
  const totalUniqueItems = items.length;
  const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

  let goodCount = 0;
  let fairCount = 0;

  items.forEach(it => {
    const qty = Number(it.quantity) || 0;
    if (it.condition === 'Good') goodCount += qty;
    else if (it.condition === 'Fair') fairCount += qty;
  });

  const operationalPct =
    totalQuantity > 0 ? Math.round(((goodCount + fairCount) / totalQuantity) * 100) : 100;

  return (
    <div className="p-4 lg:p-6 bg-gradient-to-b from-blue-50/60 to-transparent dark:from-blue-950/20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Institutional Overview Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consolidated training equipment and physical asset portfolio
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> Add Inventory Item
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Rooms</span>
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Building size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {totalRooms}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Configured training rooms</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unique Items</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Package size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {totalUniqueItems}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Distinct catalog SKUs</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Quantity</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Layers size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {totalQuantity}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Physical units tracked</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Condition Health</span>
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <ShieldCheck size={16} />
              </span>
            </div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono tabular-nums">
              {operationalPct}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Good & Fair operational units</p>
          </div>
        </div>

        {/* Room Breakdown Grid */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Facility Breakdown by Room
            </h3>
            <span className="text-xs text-slate-400">Click any room card to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rooms.map(room => {
              const counts = roomItemCounts[room.id] || { unique: 0, totalQty: 0 };
              const rItems = items.filter(i => i.roomId === room.id);
              const needsAction = rItems
                .filter(i => i.condition === 'Needs Repair' || i.condition === 'Condemned')
                .reduce((a, b) => a + (Number(b.quantity) || 0), 0);

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-950/40 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {room.name}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-400 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">
                    {room.description || 'Facility room'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800/80 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">{counts.unique}</strong> items
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      <strong className="text-emerald-700 dark:text-emerald-300">{counts.totalQty}</strong> units
                    </span>
                  </div>

                  {needsAction > 0 && (
                    <div className="mt-2 text-[10px] text-rose-500 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> {needsAction} units require attention
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
