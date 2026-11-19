import React from 'react';
import { Building, LayoutDashboard, Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Room } from '../types/inventory';

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
}

export const Sidebar: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  totalItemsCount,
  roomItemCounts
}) => {
  return (
    <aside className="hidden md:flex w-64 lg:w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-20 transition-colors">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building size={14} /> Training Facilities
        </span>
        <button
          onClick={onAddRoom}
          className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          title="Add New Room"
          aria-label="Add new facility room"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Room Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* All Rooms Button */}
        <button
          onClick={() => onSelectRoom('ALL')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            selectedRoomId === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard size={16} />
            <span>All Rooms Overview</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums ${
              selectedRoomId === 'ALL'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {totalItemsCount}
          </span>
        </button>

        <div className="pt-2 pb-1 px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Individual Rooms ({rooms.length})
          </span>
        </div>

        {rooms.map(room => {
          const counts = roomItemCounts[room.id] || { unique: 0, totalQty: 0 };
          const isSelected = selectedRoomId === room.id;

          return (
            <div
              key={room.id}
              className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/80 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <button
                onClick={() => onSelectRoom(room.id)}
                className="flex-1 text-left truncate pr-2 flex items-center gap-2"
                title={room.name}
              >
                <Package
                  size={14}
                  className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}
                />
                <span className="truncate">{room.name}</span>
              </button>

              <div className="flex items-center gap-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums ${
                    isSelected
                      ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {counts.unique}
                </span>

                <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onEditRoom(room);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Rename Room"
                    aria-label={`Rename ${room.name}`}
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteRoom(room);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Room"
                    aria-label={`Delete ${room.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
            No rooms created yet.
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={onAddRoom}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 transition-colors"
        >
          <Plus size={14} /> Add New Facility Room
        </button>
      </div>
    </aside>
  );
};
