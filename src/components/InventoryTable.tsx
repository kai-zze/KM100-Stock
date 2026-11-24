import React, { useState, useEffect, useMemo } from "react";
import { ColumnDefinition, InventoryItem, Room } from "../types/inventory";
import { ConditionBadge } from "./ConditionBadge";
import { TableSkeleton } from "./SkeletonLoader";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  /** All items to display continuously. */
  items: InventoryItem[];
  columns: ColumnDefinition[];
  rooms: Room[];
  selectedRoomId: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (colId: string) => void;
  onSelectRoom: (roomId: string) => void;
  onQuantityChange: (itemId: string, delta: number) => void;
  onSetQuantity?: (itemId: string, qty: number) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onAddItem: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  selectedIds?: string[];
  onToggleSelect?: (itemId: string) => void;
  onToggleSelectAll?: (itemIds: string[], select: boolean) => void;
  isLoading?: boolean;
}

export const InventoryTable: React.FC<Props> = ({
  items,
  columns,
  rooms,
  selectedRoomId,
  sortField,
  sortDirection,
  onSort,
  onSelectRoom,
  onQuantityChange,
  onSetQuantity,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onResetFilters,
  isFiltered,
  selectedIds = [],
  onToggleSelect = () => {},
  onToggleSelectAll = () => {},
  isLoading = false,
}) => {
  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset to page 1 whenever items count or room selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, selectedRoomId]);

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / (pageSize === -1 ? items.length || 1 : pageSize)),
  );

  // Clamp current page if total pages reduced
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return items;
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const pageIds = useMemo(
    () => paginatedItems.map((item) => item.id),
    [paginatedItems],
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.indexOf(id) !== -1);
  const somePageSelected =
    !allPageSelected && pageIds.some((id) => selectedIds.indexOf(id) !== -1);

  const setHeaderCheckbox = (node: HTMLInputElement | null) => {
    if (node) node.indeterminate = somePageSelected;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Mobile Horizontal Scroll Indicator Banner */}
      <div className="sm:hidden px-3 py-1.5 bg-amber-50/70 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between border-b border-amber-100 dark:border-amber-900/40 select-none">
        <span className="font-medium flex items-center gap-1.5">
          <span>↔</span> Swipe horizontally to view all columns &amp; actions
        </span>
        <span className="font-bold text-amber-600 dark:text-amber-400">
          ({items.length} items)
        </span>
      </div>

      <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full text-left border-collapse text-sm min-w-[720px] lg:min-w-full">
          <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 z-10">
            <tr>
              <th className="py-3.5 pl-3 sm:pl-4 pr-1 w-9 whitespace-nowrap">
                <input
                  ref={setHeaderCheckbox}
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(e) => onToggleSelectAll(pageIds, e.target.checked)}
                  aria-label="Select all items on current page"
                  className="rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                />
              </th>

              {selectedRoomId === "ALL" && (
                <th className="py-3 px-3 sm:px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs whitespace-nowrap">
                  Room Location
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    sortField === col.id
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="py-3.5 px-3 sm:px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs select-none whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.id)}
                    className="flex items-center gap-1.5 w-full text-left rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span>{col.label}</span>
                    {sortField === col.id && (
                      <span
                        className="text-amber-700 dark:text-amber-400 font-bold text-xs"
                        aria-hidden="true"
                      >
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </button>
                </th>
              ))}

              <th className="py-3.5 px-3 sm:px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedItems.map((item) => {
              const itemRoom = rooms.find((room) => room.id === item.roomId);
              const isSelected = selectedIds.indexOf(item.id) !== -1;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors group ${
                    isSelected
                      ? "bg-amber-50/70 dark:bg-amber-950/30"
                      : "hover:bg-amber-50/40 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <td className="py-2.5 sm:py-3.5 pl-3 sm:pl-4 pr-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      aria-label={`Select ${item.name}`}
                      className="rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                    />
                  </td>

                  {selectedRoomId === "ALL" && (
                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectRoom(item.roomId)}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer transition-colors"
                        title="Jump to this room"
                      >
                        {itemRoom?.name || "Unassigned"}
                      </button>
                    </td>
                  )}

                  {columns.map((col) => {
                    const val = item[col.id];

                    if (col.id === "condition" || col.id === "status") {
                      return (
                        <td
                          key={col.id}
                          className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap"
                        >
                          <ConditionBadge
                            condition={
                              val || item.status || item.condition || "Working"
                            }
                          />
                        </td>
                      );
                    }

                    if (col.id === "quantity") {
                      const numVal = Number(val) || 0;
                      return (
                        <td
                          key={col.id}
                          className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap"
                        >
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 sm:p-1">
                            <button
                              onClick={() => onQuantityChange(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-40 font-bold select-none text-xs sm:text-sm"
                              disabled={numVal <= 0}
                              title="Decrease quantity by 1"
                            >
                              −
                            </button>

                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min={0}
                              value={numVal}
                              onChange={(e) => {
                                const parsed = Math.max(
                                  0,
                                  parseInt(e.target.value, 10) || 0,
                                );
                                if (onSetQuantity) {
                                  onSetQuantity(item.id, parsed);
                                } else {
                                  onQuantityChange(item.id, parsed - numVal);
                                }
                              }}
                              aria-label={`Manual quantity input for ${item.name}`}
                              title="Click to type or edit quantity directly"
                              className="w-11 sm:w-14 px-1 py-0.5 text-center font-bold tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-amber-500 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                              onClick={() => onQuantityChange(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold select-none text-xs sm:text-sm"
                              title="Increase quantity by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={col.id}
                        className="py-2.5 sm:py-3.5 px-3 sm:px-4"
                      >
                        {col.id === "name" ? (
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block min-w-[120px]">
                            {val || "—"}
                          </span>
                        ) : col.id === "category" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                            {val || "—"}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium whitespace-nowrap">
                            {val !== undefined && val !== null && val !== ""
                              ? String(val)
                              : "—"}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold">
                      <button
                        onClick={() => onEditItem(item)}
                        aria-label={`Edit ${item.name}`}
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit Item"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                        className="px-2 py-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                        title="Delete Item"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer Pagination Bar ────────────────────────────── */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-3.5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="font-heading font-bold tabular-nums text-slate-900 dark:text-white">
                {items.length === 0
                  ? 0
                  : pageSize === -1
                    ? 1
                    : (currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="font-heading font-bold tabular-nums text-slate-900 dark:text-white">
                {pageSize === -1
                  ? items.length
                  : Math.min(currentPage * pageSize, items.length)}
              </strong>{" "}
              of{" "}
              <strong className="font-heading font-bold tabular-nums text-slate-900 dark:text-white">
                {items.length}
              </strong>{" "}
              items
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="hidden sm:inline text-slate-500">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                aria-label="Select number of rows per page"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={-1}>All ({items.length})</option>
              </select>
            </div>
          </div>

          {/* Page Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="px-2 font-heading tabular-nums text-xs font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div className="py-16 px-4 text-center">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Inventory Items Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {isFiltered
              ? "No items match your active search and filter parameters. Try clearing your filters."
              : "This room has no items registered yet. Click below to add your first training inventory item."}
          </p>
          {isFiltered ? (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Clear Search &amp; Filters
            </button>
          ) : (
            <button
              onClick={onAddItem}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              Add New Item
            </button>
          )}
        </div>
      )}
    </div>
  );
};
