import React, { useMemo } from "react";
import { AlertTriangle, Layers, Plus } from "lucide-react";
import { Room, InventoryItem } from "../types/inventory";
import { isNeedsAttention, isOutOfStockOrEmpty } from "../utils/status";

interface Props {
  rooms: Room[];
  items: InventoryItem[];
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  onSelectRoom: (roomId: string) => void;
  onAddItem: (roomId?: string) => void;
}

function cleanRoomDescription(desc?: string): string {
  if (!desc || desc === "Facility room") return "";
  const map: Record<string, string> = {
    "Contact Center Services Training Lab": "Training lab",
    "KM100 Administration & Operations Office": "Admin and operations office",
    "Computer Systems Servicing NC II Lab": "NC II lab",
    "Bread and Pastry Production Training Facility": "Production kitchen",
  };
  return map[desc] || desc;
}

export const OverviewDashboard: React.FC<Props> = React.memo(
  ({ rooms, items, roomItemCounts, onSelectRoom, onAddItem }) => {
    const totalUnits = useMemo(
      () =>
        items.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
      [items],
    );
    const attentionCount = useMemo(
      () => items.filter(isNeedsAttention).length,
      [items],
    );

    const { activeRooms, emptyRooms } = useMemo(() => {
      const active: Room[] = [];
      const empty: Room[] = [];
      rooms.forEach((r) => {
        const unique = roomItemCounts[r.id]?.unique || 0;
        if (unique > 0) {
          active.push(r);
        } else {
          empty.push(r);
        }
      });
      return { activeRooms: active, emptyRooms: empty };
    }, [rooms, roomItemCounts]);

    return (
      <div className="border-b border-slate-200 bg-slate-50/60 px-3 py-4 dark:border-slate-800 dark:bg-slate-950/60 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        <div className="w-full space-y-4 sm:space-y-5">
          {/* Header Strip */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="animate-enter">
              <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl lg:text-3xl">
                All rooms
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:mt-1 sm:text-sm md:text-base">
                Everything we have, across all rooms.
              </p>
            </div>

            <div
              className="animate-enter flex items-center gap-2"
              style={{ animationDelay: "40ms" }}
            >
              <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:flex sm:text-sm">
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {rooms.length}
                </span>
                <span>rooms</span>
                <span className="mx-0.5 text-slate-300 dark:text-slate-700">
                  &middot;
                </span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {items.length}
                </span>
                <span>items</span>
                <span className="mx-0.5 text-slate-300 dark:text-slate-700">
                  &middot;
                </span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {totalUnits.toLocaleString()}
                </span>
                <span>units</span>
              </div>

              <button
                onClick={() => onAddItem()}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-amber-600/20 transition-all hover:bg-amber-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25 active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <Plus size={16} /> Add item
              </button>
            </div>
          </div>

          {/* Status Strip & Legend */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-heading flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Layers
                    size={17}
                    className="text-amber-700 dark:text-amber-400"
                  />
                  Rooms
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  Click View on any room to see its items.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="shadow-2xs flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span>Operational</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50/60 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>Needs attention</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/60 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>Empty</span>
                  </span>
                </div>

                {attentionCount > 0 && (
                  <span className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{attentionCount} items flagged</span>
                  </span>
                )}
              </div>
            </div>

            {rooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  No rooms yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a room from the sidebar to start tracking its inventory.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Prominent Active Rooms Grid */}
                {activeRooms.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {activeRooms.map((room) => {
                      const counts = roomItemCounts[room.id] || {
                        unique: 0,
                        totalQty: 0,
                      };
                      const roomItems = items.filter(
                        (item) => item.roomId === room.id,
                      );
                      const needsAttentionCount =
                        roomItems.filter(isNeedsAttention).length;
                      const lowStockCount = roomItems.filter(
                        (i) =>
                          Number(i.quantity) > 0 && Number(i.quantity) <= 5,
                      ).length;
                      const outOfStockCount =
                        roomItems.filter(isOutOfStockOrEmpty).length;
                      const displayDesc = cleanRoomDescription(
                        room.description,
                      );

                      const needsAttention =
                        needsAttentionCount > 0 ||
                        lowStockCount > 0 ||
                        outOfStockCount > 0;

                      return (
                        <div
                          key={room.id}
                          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div>
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-heading text-base font-bold leading-snug text-slate-900 dark:text-white">
                                  {room.name}
                                </p>
                                {displayDesc ? (
                                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    {displayDesc}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="mb-3 grid grid-cols-2 gap-2">
                              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/70">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Items
                                </p>
                                <p className="mt-1 text-lg font-bold leading-tight tabular-nums text-slate-900 dark:text-white sm:text-xl">
                                  {counts.unique}
                                </p>
                              </div>
                              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/70">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Units
                                </p>
                                <p className="mt-1 text-lg font-bold leading-tight tabular-nums text-slate-900 dark:text-white sm:text-xl">
                                  {counts.totalQty.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
                            {needsAttention ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {outOfStockCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                                    <AlertTriangle size={12} />
                                    {outOfStockCount} out of stock
                                  </span>
                                )}
                                {lowStockCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                                    <AlertTriangle size={12} />
                                    {lowStockCount} low
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Operational
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onSelectRoom(room.id)}
                              className="cursor-pointer text-xs font-bold text-slate-700 transition-colors hover:text-amber-700 hover:underline focus:outline-none focus-visible:underline dark:text-slate-300 dark:hover:text-amber-400"
                              title={`View ${room.name} items`}
                              aria-label={`View ${room.name} items`}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Subtle Compact Empty Rooms Section */}
                {emptyRooms.length > 0 && (
                  <div className="pt-2">
                    <div className="mb-2.5 flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Empty rooms ({emptyRooms.length})
                        </h4>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Ready for equipment registration
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {emptyRooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-left transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-snug text-slate-800 dark:text-slate-200 sm:text-sm">
                              {room.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                              Empty
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectRoom(room.id)}
                              className="cursor-pointer px-1 py-1 text-xs font-bold text-slate-700 transition-colors hover:text-amber-700 hover:underline focus:outline-none focus-visible:underline dark:text-slate-300 dark:hover:text-amber-400"
                              title={`View ${room.name}`}
                              aria-label={`View ${room.name}`}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddItem(room.id)}
                              className="shadow-2xs flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                              title={`Add equipment to ${room.name}`}
                              aria-label={`Add equipment to ${room.name}`}
                            >
                              <Plus
                                size={13}
                                className="text-amber-600 dark:text-amber-400"
                              />
                              <span>Add item</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

OverviewDashboard.displayName = "OverviewDashboard";
