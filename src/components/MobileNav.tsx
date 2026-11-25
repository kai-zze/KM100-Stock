import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Building,
  Check,
  ChevronDown,
  Edit,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Room,
  Facility,
  DEFAULT_FACILITIES,
  normalizeFacilityId,
  UserRole,
} from "../types/inventory";

interface Props {
  rooms: Room[];
  facilities?: Facility[];
  selectedRoomId: string;
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  onAddFacility?: () => void;
  onEditFacility?: (facility: Facility) => void;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  roomAttentionCounts?: Record<string, number>;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onEditRoom?: (room: Room) => void;
  onDeleteRoom?: (room: Room) => void;
  onClose: () => void;
  userRole?: UserRole;
}

/** Slide-in rooms menu for phones and small tablets. */
export const MobileNav: React.FC<Props> = React.memo(
  ({
    rooms,
    facilities = DEFAULT_FACILITIES,
    selectedRoomId,
    selectedFacilityId = "ALL",
    onSelectFacility,
    onAddFacility,
    onEditFacility,
    totalItemsCount,
    roomItemCounts,
    roomAttentionCounts = {},
    onSelectRoom,
    onAddRoom,
    onEditRoom,
    onDeleteRoom,
    onClose,
    userRole,
  }) => {
    const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
    const [facilitySearch, setFacilitySearch] = useState("");
    const facilityDropdownRef = useRef<HTMLDivElement>(null);

    // Close facility dropdown first on Escape, or close mobile drawer
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (isFacilityDropdownOpen) {
            setIsFacilityDropdownOpen(false);
            setFacilitySearch("");
          } else {
            onClose();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFacilityDropdownOpen, onClose]);

    useEffect(() => {
      if (!isFacilityDropdownOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          facilityDropdownRef.current &&
          !facilityDropdownRef.current.contains(e.target as Node)
        ) {
          setIsFacilityDropdownOpen(false);
          setFacilitySearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isFacilityDropdownOpen]);

    const activeFacility = useMemo(() => {
      if (selectedFacilityId === "ALL") return null;
      return facilities.find((f) => f.id === selectedFacilityId);
    }, [facilities, selectedFacilityId]);

    const filteredFacilities = useMemo(() => {
      if (!Array.isArray(facilities)) return DEFAULT_FACILITIES;
      const term = facilitySearch.trim().toLowerCase();
      if (!term) return facilities;
      return facilities.filter(
        (f) =>
          f &&
          ((f.name && f.name.toLowerCase().includes(term)) ||
            (f.code && f.code.toLowerCase().includes(term)) ||
            (f.fullName && f.fullName.toLowerCase().includes(term))),
      );
    }, [facilities, facilitySearch]);

    const facilityFilteredRooms = useMemo(() => {
      if (selectedFacilityId === "ALL") return rooms;
      return rooms.filter(
        (r) =>
          normalizeFacilityId(r.facility, facilities) === selectedFacilityId,
      );
    }, [rooms, selectedFacilityId, facilities]);

    const renderRoomRow = (room: Room) => {
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
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotTone}`} />
            <span className="truncate">{room.name}</span>
          </button>

          <div className="flex items-center gap-1 shrink-0 pl-1">
            <span
              className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500"
              title={`${counts.totalQty.toLocaleString()} units`}
            >
              {counts.totalQty.toLocaleString()}
            </span>
            {onEditRoom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onEditRoom(room);
                }}
                className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Rename room"
                aria-label={`Rename ${room.name}`}
              >
                <Edit size={12} />
              </button>
            )}
            {onDeleteRoom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onDeleteRoom(room);
                }}
                className="rounded p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                title="Delete room"
                aria-label={`Delete ${room.name}`}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      );
    };

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
        <div
          id="tour-mobile-drawer"
          className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-down"
        >
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
                  Facilities &amp; Rooms
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {facilityFilteredRooms.length} rooms &bull; {totalItemsCount}{" "}
                  items
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

          {/* Executive Facility Dropdown Switcher on Mobile */}
          {onSelectFacility && (
            <div
              className="p-2 border-b border-slate-200 dark:border-slate-800 relative"
              ref={facilityDropdownRef}
            >
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Facility Scope
                </span>
                {userRole === "admin" && onAddFacility && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddFacility();
                      onClose();
                    }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <Plus size={11} /> Facility
                  </button>
                )}
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsFacilityDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border text-left transition-all shadow-sm group cursor-pointer ${
                  isFacilityDropdownOpen
                    ? "border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                aria-expanded={isFacilityDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="min-w-0 flex-1">
                  {selectedFacilityId === "ALL" ? (
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                        All Facilities
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {facilities.length} branches &bull; {rooms.length} rooms
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                        {activeFacility?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {facilityFilteredRooms.length}{" "}
                        {facilityFilteredRooms.length === 1 ? "room" : "rooms"}
                      </p>
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform shrink-0 ${
                    isFacilityDropdownOpen
                      ? "rotate-180 text-amber-700 dark:text-amber-400"
                      : ""
                  }`}
                />
              </button>

              {/* Popover Menu on Mobile */}
              {isFacilityDropdownOpen && (
                <div className="absolute left-2 right-2 top-full mt-1 z-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-slide-down flex flex-col max-h-72">
                  {facilities.length >= 4 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="relative flex items-center">
                        <Search
                          size={13}
                          className="absolute left-2.5 text-slate-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder="Search facilities..."
                          value={facilitySearch}
                          onChange={(e) => setFacilitySearch(e.target.value)}
                          className="w-full pl-7 pr-7 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          autoFocus
                        />
                        {facilitySearch && (
                          <button
                            type="button"
                            onClick={() => setFacilitySearch("")}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-48">
                    {/* All Facilities Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectFacility("ALL");
                        setIsFacilityDropdownOpen(false);
                        setFacilitySearch("");
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                        selectedFacilityId === "ALL"
                          ? "bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">All Facilities</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          Enterprise Master Scope
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                          {rooms.length} rooms
                        </span>
                        {selectedFacilityId === "ALL" && (
                          <Check
                            size={14}
                            className="text-amber-700 dark:text-amber-400"
                          />
                        )}
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    {filteredFacilities.map((fac) => {
                      const isSelected = selectedFacilityId === fac.id;
                      const facRoomCount = rooms.filter(
                        (r) =>
                          normalizeFacilityId(r.facility, facilities) ===
                          fac.id,
                      ).length;

                      return (
                        <div
                          key={fac.id}
                          className={`group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
                            isSelected
                              ? "bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectFacility(fac.id);
                              setIsFacilityDropdownOpen(false);
                              setFacilitySearch("");
                            }}
                            className="flex items-center min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs">{fac.name}</p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0 pl-1">
                            <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                              {facRoomCount}
                            </span>
                            {isSelected && (
                              <Check
                                size={14}
                                className="text-amber-700 dark:text-amber-400 shrink-0 ml-0.5"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {userRole === "admin" && onAddFacility && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-1.5 bg-slate-50/60 dark:bg-slate-900/60">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFacilityDropdownOpen(false);
                          setFacilitySearch("");
                          onClose();
                          onAddFacility();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Plus size={13} /> Add New Facility
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                {selectedFacilityId === "ALL"
                  ? "All rooms"
                  : `All ${facilities.find((f) => f.id === selectedFacilityId)?.name || selectedFacilityId} rooms`}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] tabular-nums shrink-0 ${
                  selectedRoomId === "ALL"
                    ? "bg-amber-800 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
                title={`${totalItemsCount.toLocaleString()} items`}
              >
                {totalItemsCount.toLocaleString()}
              </span>
            </button>

            {/* Grouped or Flat Rooms List */}
            {selectedFacilityId === "ALL" ? (
              <>
                {facilities.map((fac) => {
                  const roomsInFac = facilityFilteredRooms.filter(
                    (r) =>
                      normalizeFacilityId(r.facility, facilities) === fac.id,
                  );
                  if (roomsInFac.length === 0) return null;
                  return (
                    <div key={fac.id} className="pt-2">
                      <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{fac.name}</span>
                          {userRole === "admin" && onEditFacility && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditFacility(fac);
                                onClose();
                              }}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded cursor-pointer"
                              title={`Edit ${fac.name} facility`}
                            >
                              <Edit size={10} />
                            </button>
                          )}
                        </div>
                        <span className="font-normal lowercase shrink-0">
                          {roomsInFac.length}{" "}
                          {roomsInFac.length === 1 ? "room" : "rooms"}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {roomsInFac.map((room) => renderRoomRow(room))}
                      </div>
                    </div>
                  );
                })}
                {(() => {
                  const facIds = new Set(facilities.map((f) => f.id));
                  const orphanedRooms = facilityFilteredRooms.filter(
                    (r) =>
                      !facIds.has(normalizeFacilityId(r.facility, facilities)),
                  );
                  if (orphanedRooms.length === 0) return null;
                  return (
                    <div className="pt-2">
                      <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <span className="truncate">Other Rooms</span>
                        <span className="font-normal lowercase shrink-0">
                          {orphanedRooms.length}{" "}
                          {orphanedRooms.length === 1 ? "room" : "rooms"}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {orphanedRooms.map((room) => renderRoomRow(room))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate">
                      {facilities.find((f) => f.id === selectedFacilityId)
                        ?.name || selectedFacilityId}{" "}
                      Rooms
                    </span>
                    {userRole === "admin" && onEditFacility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetFac = facilities.find(
                            (f) => f.id === selectedFacilityId,
                          );
                          if (targetFac) {
                            onEditFacility(targetFac);
                            onClose();
                          }
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded cursor-pointer"
                        title="Edit facility settings"
                      >
                        <Edit size={10} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5">
                  {facilityFilteredRooms.map((room) => renderRoomRow(room))}
                </div>
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
