import React from "react";
import { Building, Edit, LayoutDashboard, Plus, Trash2, X } from "lucide-react";
import { Room } from "../types/inventory";

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  roomAttentionCounts?: Record<string, number>;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onEditRoom?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
  onClose: () => void;
}

/** Slide-in rooms menu for phones and small tablets. */
export const MobileNav: React.FC<Props> = React.memo(
  ({
    rooms,
    selectedRoomId,
    totalItemsCount,
    roomItemCounts,
    roomAttentionCounts = {},
    onSelectRoom,
    onAddRoom,
    onEditRoom,
    onDeleteRoom,
    onClose,
  }) => {
    // Close mobile drawer on Escape key press
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 z-50 flex md:hidden no-print animate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-drawer-title"
      >
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />
        <div className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-down">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-50 dark:bg-amber-950/60 p-1.5 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-900/60">
                <Building size={16} />
              </span>
              <div>
                <h3
                  id="mobile-drawer-title"
                  className="text-sm font-heading font-bold text-slate-900 dark:text-white"
                >
                  Rooms
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {rooms.length} rooms &bull; {totalItemsCount} items
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close rooms menu"
              className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            <button
              onClick={() => {
                onSelectRoom("ALL");
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedRoomId === "ALL"
                  ? "bg-amber-700 text-white shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard size={15} />
                All rooms
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] tabular-nums ${
                  selectedRoomId === "ALL"
                    ? "bg-amber-800 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {totalItemsCount}
              </span>
            </button>

            <div className="px-2 pb-1 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Rooms
            </div>

            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const counts = roomItemCounts[room.id] || {
                unique: 0,
                totalQty: 0,
              };
              const attention = roomAttentionCounts[room.id] || 0;
              const dotTone =
                attention > 0
                  ? "bg-rose-500"
                  : counts.unique > 0
                    ? "bg-emerald-500"
                    : "bg-slate-300 dark:bg-slate-600";

              return (
                <div
                  key={room.id}
                  className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors ${
                    isSelected
                      ? "bg-amber-50/80 dark:bg-amber-950/40 font-semibold text-amber-900 dark:text-amber-200"
                      : "font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectRoom(room.id);
                      onClose();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left py-1 cursor-pointer"
                    title={`Open ${room.name}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotTone}`}
                    />
                    <span className="truncate">{room.name}</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 pl-1">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                        isSelected
                          ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {counts.unique}
                    </span>

                    {onEditRoom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onEditRoom(room);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        title={`Rename ${room.name}`}
                        aria-label={`Rename ${room.name}`}
                      >
                        <Edit size={12} />
                      </button>
                    )}

                    {onDeleteRoom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onDeleteRoom(room);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title={`Delete ${room.name}`}
                        aria-label={`Delete ${room.name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {rooms.length === 0 && (
              <div className="px-3 py-8 text-center">
                <Building
                  size={20}
                  className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
                />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  No rooms yet
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 p-3">
            <button
              onClick={onAddRoom}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-amber-600/20 transition-all hover:bg-amber-800 active:scale-[0.98] cursor-pointer"
            >
              <Plus size={14} /> Add new room
            </button>
          </div>
        </div>
      </div>
    );
  },
);

MobileNav.displayName = "MobileNav";
