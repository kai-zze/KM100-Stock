import React, { useMemo, useState, useEffect } from "react";
import { ColumnDefinition, InventoryItem, Room } from "../types/inventory";
import { ConditionBadge } from "./ConditionBadge";
import { TableSkeleton } from "./SkeletonLoader";

interface QuantityInputProps {
  value: number;
  itemName: string;
  onCommit: (nextQty: number) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  itemName,
  onCommit,
}) => {
  const [draft, setDraft] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(String(value));
    }
  }, [value, isFocused]);

  const commitDraft = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setDraft(String(value));
      return;
    }
    const parsed = Math.max(0, parseInt(trimmed, 10) || 0);
    setDraft(String(parsed));
    if (parsed !== value) {
      onCommit(parsed);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={isFocused ? draft : String(value)}
      onFocus={(e) => {
        setIsFocused(true);
        setDraft(String(value));
        e.target.select();
      }}
      onChange={(e) => {
        const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
        setDraft(digitsOnly);
        if (digitsOnly !== "") {
          const parsed = Math.max(0, parseInt(digitsOnly, 10) || 0);
          onCommit(parsed);
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        commitDraft(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
          setDraft(String(value));
          setIsFocused(false);
          (e.target as HTMLInputElement).blur();
        }
      }}
      aria-label={`Manual quantity input for ${itemName}`}
      title="Click to type or edit quantity directly"
      style={{
        width: `${Math.max(3, (isFocused ? draft : String(value)).length + 1)}ch`,
      }}
      className="min-w-[2.75rem] max-w-[6rem] px-1.5 py-0.5 text-center font-bold tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-amber-500 rounded transition-all"
    />
  );
};

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
  // Always execute Hooks unconditionally before any early return (Rules of Hooks)
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const allSelected =
    itemIds.length > 0 && itemIds.every((id) => selectedIds.indexOf(id) !== -1);
  const someSelected =
    !allSelected && itemIds.some((id) => selectedIds.indexOf(id) !== -1);

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  const setHeaderCheckbox = (node: HTMLInputElement | null) => {
    if (node) node.indeterminate = someSelected;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Mobile Horizontal Scroll Indicator Banner */}
      <div className="sm:hidden px-3 py-1.5 bg-amber-50/70 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between border-b border-amber-100 dark:border-amber-900/40 select-none">
        <span className="font-medium flex items-center gap-1.5">
          <span>↔</span> Swipe horizontally to view all columns &amp; actions
        </span>
        <span className="font-bold text-amber-600 dark:text-amber-400">
          ({items.length.toLocaleString()} items)
        </span>
      </div>

      <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full text-left border-collapse text-sm min-w-[720px] lg:min-w-full">
          <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 z-10">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-3 sm:pl-4 pr-1 w-9 whitespace-nowrap"
              >
                <input
                  ref={setHeaderCheckbox}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(itemIds, e.target.checked)}
                  aria-label="Select all items"
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
            {items.map((item, itemIdx) => {
              const itemRoom = rooms.find((room) => room.id === item.roomId);
              const isSelected = selectedIds.indexOf(item.id) !== -1;

              return (
                <tr
                  key={item.id}
                  id={itemIdx === 0 ? "tour-table-row" : undefined}
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
                        title="Jump to home facility room"
                      >
                        {itemRoom?.name || "Unassigned"}
                      </button>
                    </td>
                  )}

                  {columns.map((col) => {
                    const val =
                      item[col.id] !== undefined
                        ? item[col.id]
                        : item.custom_fields?.[col.id];

                    if (col.id === "condition" || col.id === "status") {
                      const condVal =
                        val || item.status || item.condition || "Working";

                      return (
                        <td
                          key={col.id}
                          className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap"
                        >
                          <ConditionBadge condition={condVal} />
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
                          <div
                            id={
                              itemIdx === 0
                                ? "tour-quantity-stepper"
                                : undefined
                            }
                            className="inline-flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 sm:p-1"
                          >
                            <button
                              type="button"
                              onClick={() => onQuantityChange(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-40 font-bold select-none text-xs sm:text-sm cursor-pointer disabled:cursor-not-allowed"
                              disabled={numVal <= 0}
                              title="Decrease quantity by 1"
                            >
                              −
                            </button>

                            <QuantityInput
                              value={numVal}
                              itemName={item.name}
                              onCommit={(parsed) => {
                                if (onSetQuantity) {
                                  onSetQuantity(item.id, parsed);
                                } else {
                                  onQuantityChange(item.id, parsed - numVal);
                                }
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => onQuantityChange(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bold select-none text-xs sm:text-sm cursor-pointer"
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
                          <button
                            type="button"
                            onClick={() => onEditItem(item)}
                            className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-left hover:text-amber-700 dark:hover:text-amber-400 hover:underline transition-colors cursor-pointer"
                            title="Click to edit item"
                          >
                            {val || "—"}
                          </button>
                        ) : col.id === "category" ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap ${
                              val === "Deployed" || val === "Deploy"
                                ? "bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {val || "—"}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium whitespace-nowrap">
                            {val !== undefined && val !== null && val !== ""
                              ? Array.isArray(val)
                                ? val.join(", ")
                                : String(val)
                              : "—"}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                    <div
                      id={itemIdx === 0 ? "tour-row-actions" : undefined}
                      className="flex items-center justify-end gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold"
                    >
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        aria-label={`Edit ${item.name}`}
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                        className="px-2 py-1 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
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
