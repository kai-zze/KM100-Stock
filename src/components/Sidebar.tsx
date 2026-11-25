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
  UserRole,
  Facility,
  DEFAULT_FACILITIES,
  normalizeFacilityId,
} from "../types/inventory";

interface Props {
  rooms: Room[];
  facilities?: Facility[];
  selectedRoomId: string;
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  onAddFacility?: () => void;
  onEditFacility?: (facility: Facility) => void;
  onDeleteFacility?: (facility: Facility) => void;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  roomAttentionCounts?: Record<string, number>;
  userRole?: UserRole;
}

export const Sidebar: React.FC<Props> = React.memo(
  ({
    rooms,
    facilities = DEFAULT_FACILITIES,
    selectedRoomId,
    selectedFacilityId = "ALL",
    onSelectFacility,
    onAddFacility,
    onEditFacility,
    onDeleteFacility: _onDeleteFacility,
    onSelectRoom,
    onAddRoom,
    onEditRoom,
    onDeleteRoom,
    totalItemsCount,
    roomItemCounts: _roomItemCounts,
    roomAttentionCounts: _roomAttentionCounts,
    userRole,
  }) => {
    const [query, setQuery] = useState("");
    const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
    const [facilitySearch, setFacilitySearch] = useState("");
    const facilityDropdownRef = useRef<HTMLDivElement>(null);

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
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFacilityDropdownOpen(false);
          setFacilitySearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isFacilityDropdownOpen]);

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

    const activeFacility = useMemo(() => {
      if (selectedFacilityId === "ALL") return null;
      return facilities.find((f) => f.id === selectedFacilityId);
    }, [facilities, selectedFacilityId]);

    const facilityFilteredRooms = useMemo(() => {
      if (selectedFacilityId === "ALL") return rooms;
      return rooms.filter(
        (r) =>
          normalizeFacilityId(r.facility, facilities) === selectedFacilityId,
      );
    }, [rooms, selectedFacilityId, facilities]);

    const filteredRooms = useMemo(() => {
      const term = query.trim().toLowerCase();
      if (!term) return facilityFilteredRooms;
      return facilityFilteredRooms.filter(
        (room) =>
          room.name.toLowerCase().includes(term) ||
          (room.description && room.description.toLowerCase().includes(term)),
      );
    }, [facilityFilteredRooms, query]);

    const renderRoomRow = (room: Room) => {
      const isSelected = selectedRoomId === room.id;
      return (
        <div
          key={room.id}
          className={`group relative flex items-center rounded-lg transition-colors ${
            isSelected
              ? "bg-amber-50/80 dark:bg-amber-950/40"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
        >
          <button
            onClick={() => onSelectRoom(room.id)}
            className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 cursor-pointer"
            title={room.name}
          >
            <span
              className={`truncate text-xs sm:text-sm ${
                isSelected
                  ? "font-semibold text-amber-900 dark:text-amber-200"
                  : "font-medium text-slate-700 dark:text-slate-300"
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
    };

    return (
      <aside
        id="tour-sidebar"
        className="z-20 hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex lg:w-72 xl:w-80"
      >
        <div className="border-b border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Inventory
            </h1>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {facilities.length} Facilities
            </span>
          </div>

          {/* Executive Facility Dropdown Switcher */}
          {onSelectFacility && (
            <div className="mt-2.5 relative" ref={facilityDropdownRef}>
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Facility Scope
                </span>
                {userRole === "admin" && onAddFacility && (
                  <button
                    type="button"
                    onClick={onAddFacility}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    title="Add new facility branch"
                  >
                    <Plus size={12} /> Add Facility
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
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                      : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                />
              </button>

              {/* Popover Menu */}
              {isFacilityDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-slide-down flex flex-col max-h-80">
                  {/* Search box if 4 or more facilities */}
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
                          className="w-full pl-7 pr-7 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          autoFocus
                        />
                        {facilitySearch && (
                          <button
                            type="button"
                            onClick={() => setFacilitySearch("")}
                            aria-label="Clear facility search"
                            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Facilities List */}
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-56">
                    {/* All Facilities Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectFacility("ALL");
                        setIsFacilityDropdownOpen(false);
                        setFacilitySearch("");
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
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

                    {/* Filtered facilities */}
                    {filteredFacilities.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-400">
                        No facilities found
                      </div>
                    ) : (
                      filteredFacilities.map((fac) => {
                        const isSelected = selectedFacilityId === fac.id;
                        const facRoomCount = rooms.filter(
                          (r) =>
                            normalizeFacilityId(r.facility, facilities) ===
                            fac.id,
                        ).length;

                        return (
                          <div
                            key={fac.id}
                            className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
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
                                {fac.description && (
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">
                                    {fac.description}
                                  </p>
                                )}
                              </div>
                            </button>

                            <div className="flex items-center gap-1 shrink-0 pl-1">
                              <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                                {facRoomCount}{" "}
                                {facRoomCount === 1 ? "room" : "rooms"}
                              </span>
                              {userRole === "admin" && onEditFacility && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFacilityDropdownOpen(false);
                                    onEditFacility(fac);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded"
                                  title={`Edit ${fac.name} settings`}
                                >
                                  <Edit size={11} />
                                </button>
                              )}
                              {isSelected && (
                                <Check
                                  size={14}
                                  className="text-amber-700 dark:text-amber-400 shrink-0 ml-0.5"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Facility Footer inside dropdown */}
                  {userRole === "admin" && onAddFacility && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-1.5 bg-slate-50/60 dark:bg-slate-900/60">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFacilityDropdownOpen(false);
                          setFacilitySearch("");
                          onAddFacility();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Plus size={13} /> Add New Facility
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Executive KPI Stat Cards (Rooms & Items) */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
            {/* Rooms Stat Card */}
            <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/40 py-2.5 px-2 transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow shadow-sm">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {selectedFacilityId === "ALL" ? "Total Rooms" : "Rooms"}
              </p>
              <p
                className={`mt-1 font-heading font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white leading-none ${
                  facilityFilteredRooms.length >= 1000
                    ? "text-xl sm:text-2xl"
                    : "text-2xl sm:text-3xl"
                }`}
                title={`${facilityFilteredRooms.length.toLocaleString()} rooms`}
              >
                {facilityFilteredRooms.length.toLocaleString()}
              </p>
            </div>

            {/* Items Stat Card */}
            <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-800/90 dark:to-slate-800/40 py-2.5 px-2 transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow shadow-sm">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {selectedFacilityId === "ALL" ? "Total Items" : "Items"}
              </p>
              <p
                className={`mt-1 font-heading font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white leading-none ${
                  totalItemsCount >= 100000
                    ? "text-lg sm:text-xl"
                    : totalItemsCount >= 10000
                      ? "text-xl sm:text-2xl"
                      : "text-2xl sm:text-3xl"
                }`}
                title={`${totalItemsCount.toLocaleString()} catalog items`}
              >
                {totalItemsCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative mt-2.5">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rooms..."
              aria-label="Search rooms"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 py-1.5 pl-9 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear room search"
                className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <button
            onClick={() => onSelectRoom("ALL")}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer ${
              selectedRoomId === "ALL"
                ? "bg-amber-700 text-white shadow-sm shadow-amber-600/20"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard size={16} />
              {selectedFacilityId === "ALL"
                ? "All rooms"
                : `All ${activeFacility?.name || selectedFacilityId} rooms`}
            </span>
          </button>

          {/* Grouped or Flat Rooms List */}
          {selectedFacilityId === "ALL" ? (
            <>
              {facilities.map((fac) => {
                const roomsInFac = filteredRooms.filter(
                  (r) => normalizeFacilityId(r.facility, facilities) === fac.id,
                );
                if (roomsInFac.length === 0) return null;
                return (
                  <div key={fac.id} className="pt-3">
                    <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate">{fac.name}</span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-normal lowercase">
                          {roomsInFac.length}{" "}
                          {roomsInFac.length === 1 ? "room" : "rooms"}
                        </span>
                        {userRole === "admin" && onEditFacility && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditFacility(fac);
                            }}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            title={`Edit ${fac.name}`}
                          >
                            <Edit size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {roomsInFac.map((room) => renderRoomRow(room))}
                    </div>
                  </div>
                );
              })}
              {(() => {
                const facIds = new Set(facilities.map((f) => f.id));
                const orphanedRooms = filteredRooms.filter(
                  (r) =>
                    !facIds.has(normalizeFacilityId(r.facility, facilities)),
                );
                if (orphanedRooms.length === 0) return null;
                return (
                  <div className="pt-3">
                    <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <span className="truncate">Other Rooms</span>
                      <span className="text-[10px] font-normal lowercase">
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
            <div className="pt-3">
              <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span className="truncate">
                  {activeFacility?.name || selectedFacilityId} Rooms
                </span>
                {userRole === "admin" && activeFacility && onEditFacility && (
                  <button
                    type="button"
                    onClick={() => onEditFacility(activeFacility)}
                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    title={`Edit ${activeFacility.name}`}
                  >
                    <Edit size={11} />
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {filteredRooms.map((room) => renderRoomRow(room))}
              </div>
            </div>
          )}

          {rooms.length === 0 && (
            <div className="px-3 py-8 text-center">
              <Building
                size={20}
                className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
              />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                No rooms yet
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                Add a room to get started.
              </p>
            </div>
          )}

          {rooms.length > 0 && filteredRooms.length === 0 && (
            <div className="px-3 py-8 text-center">
              <Search
                size={18}
                className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
              />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                No matching rooms
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3">
          <button
            onClick={onAddRoom}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          >
            <Plus size={14} /> Add room
          </button>
        </div>
      </aside>
    );
  },
);

Sidebar.displayName = "Sidebar";
