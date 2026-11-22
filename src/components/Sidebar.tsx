import React, { useMemo, useState } from 'react';
import {
  Building,
  Edit,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Room, UserRole } from '../types/inventory';

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  roomAttentionCounts?: Record<string, number>;
  userRole?: UserRole;
}

export const Sidebar: React.FC<Props> = React.memo(({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  totalItemsCount,
  roomItemCounts: _roomItemCounts,
  roomAttentionCounts: _roomAttentionCounts,
  userRole,
}) => {
  const [query, setQuery] = useState('');

  const filteredRooms = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rooms;
    return rooms.filter((room) => room.name.toLowerCase().includes(term));
  }, [rooms, query]);

  return (
    <aside className="z-20 hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex lg:w-72 xl:w-80">
      <div className="border-b border-slate-200 dark:border-slate-800 p-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory
          </h1>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 px-3 py-2 ring-1 ring-slate-100 dark:ring-slate-700/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rooms
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {rooms.length}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 px-3 py-2 ring-1 ring-slate-100 dark:ring-slate-700/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Items
            </p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {totalItemsCount}
            </p>
          </div>
        </div>

        <div className="relative mt-3">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rooms"
            aria-label="Search rooms"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear room search"
              className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onSelectRoom('ALL')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            selectedRoomId === 'ALL'
              ? 'bg-amber-700 text-white shadow-sm shadow-amber-600/20'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <LayoutDashboard size={16} />
            All rooms
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
              selectedRoomId === 'ALL'
                ? 'bg-amber-800 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {totalItemsCount}
          </span>
        </button>

        <div className="px-2 pb-1.5 pt-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Rooms
          </span>
        </div>

        <div className="space-y-0.5">
          {filteredRooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            return (
              <div
                key={room.id}
                className={`group relative flex items-center rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <button
                  onClick={() => onSelectRoom(room.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500"
                  title={room.name}
                >
                  <span
                    className={`truncate text-xs sm:text-sm ${
                      isSelected ? 'font-semibold text-amber-900 dark:text-amber-200' : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {room.name}
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-1 pr-2">
                  <div className="hidden items-center gap-0.5 group-hover:flex group-focus-within:flex">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditRoom(room);
                      }}
                      className="rounded p-1 text-slate-400 dark:text-slate-500 transition-colors hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="Rename room"
                      aria-label={`Rename ${room.name}`}
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteRoom(room);
                      }}
                      className="rounded p-1 text-slate-400 dark:text-slate-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                      title="Delete room"
                      aria-label={`Delete ${room.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {rooms.length === 0 && (
          <div className="px-3 py-8 text-center">
            <Building size={20} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No rooms yet</p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Add a room to get started.</p>
          </div>
        )}

        {rooms.length > 0 && filteredRooms.length === 0 && (
          <div className="px-3 py-8 text-center">
            <Search size={18} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No matching rooms</p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3">
        <button
          onClick={onAddRoom}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Plus size={15} /> Add room
        </button>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
