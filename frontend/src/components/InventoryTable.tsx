import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  ColumnDefinition,
  InventoryItem,
  Room
} from '../types/inventory';
import { ConditionBadge } from './ConditionBadge';
import { Package, PackageX, Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  /** All items to display continuously. */
  items: InventoryItem[];
  columns: ColumnDefinition[];
  rooms: Room[];
  selectedRoomId: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
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
}) => {
  const [pageSize, setPageSize] = useState<number | 'ALL'>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page when room, sorting, or filter parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, selectedRoomId, sortField, sortDirection]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    if (pageSize === 'ALL') return items;
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const pageIds = paginatedItems.map((item) => item.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.indexOf(id) !== -1);
  const somePageSelected =
    !allPageSelected && pageIds.some((id) => selectedIds.indexOf(id) !== -1);

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = somePageSelected;
    }
  }, [somePageSelected]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Mobile Horizontal Scroll Indicator Banner */}
      <div className="sm:hidden px-3 py-1.5 bg-amber-50/70 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between border-b border-amber-100 dark:border-amber-900/40 select-none">
        <span className="font-medium flex items-center gap-1.5">
          <span>↔</span> Swipe horizontally to view all columns &amp; actions
        </span>
        <span className="font-bold text-amber-600 dark:text-amber-400">({items.length} items)</span>
      </div>

      <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="w-full text-left border-collapse text-sm min-w-[720px] lg:min-w-full">
          <thead className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)]">
            <tr>
              <th className="py-3.5 pl-3 sm:pl-4 pr-1 w-9 whitespace-nowrap">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(e) => onToggleSelectAll(pageIds, e.target.checked)}
                  aria-label="Select all items on this page"
                  className="rounded border-slate-300 dark:border-slate-700 text-amber-700 focus:ring-amber-600 cursor-pointer h-4 w-4"
                />
              </th>

              {selectedRoomId === 'ALL' && (
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
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
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
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-xs" aria-hidden="true">
                        {sortDirection === 'asc' ? '▲' : '▼'}
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
                      ? 'bg-amber-50/70 dark:bg-amber-950/30'
                      : 'hover:bg-amber-50/40 dark:hover:bg-slate-800/50'
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

                  {selectedRoomId === 'ALL' && (
                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectRoom(item.roomId)}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer transition-colors"
                        title="Jump to this room"
                      >
                        {itemRoom?.name || 'Unassigned'}
                      </button>
                    </td>
                  )}

                  {columns.map((col) => {
                    const val = item[col.id];

                    if (col.id === 'condition' || col.id === 'status') {
                      return (
                        <td key={col.id} className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          <ConditionBadge
                            condition={val || item.status || item.condition || 'Working'}
                          />
                        </td>
                      );
                    }

                    if (col.id === 'quantity') {
                      const numVal = Number(val) || 0;
                      return (
                        <td key={col.id} className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 sm:p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onQuantityChange(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 active:scale-90 active:bg-rose-100 dark:active:bg-rose-900/50 transition-all disabled:opacity-40 font-bold select-none text-xs sm:text-sm cursor-pointer"
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
                                const parsed = Math.max(0, parseInt(e.target.value, 10) || 0);
                                if (onSetQuantity) {
                                  onSetQuantity(item.id, parsed);
                                } else {
                                  onQuantityChange(item.id, parsed - numVal);
                                }
                              }}
                              aria-label={`Manual quantity input for ${item.name}`}
                              title="Click to type or edit quantity directly"
                              className="w-11 sm:w-14 px-1 py-0.5 text-center font-mono font-bold tabular-nums text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-amber-500 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                              type="button"
                              onClick={() => onQuantityChange(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-90 active:bg-emerald-100 dark:active:bg-emerald-900/50 transition-all font-bold select-none text-xs sm:text-sm cursor-pointer"
                              title="Increase quantity by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={col.id} className="py-2.5 sm:py-3.5 px-3 sm:px-4">
                        {col.id === 'name' ? (
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm block min-w-[120px]">{val || '—'}</span>
                        ) : col.id === 'category' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                            {val || '—'}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium whitespace-nowrap">
                            {val !== undefined && val !== null && val !== ''
                              ? String(val)
                              : '—'}
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

      {items.length === 0 && (
        <div className="py-16 sm:py-20 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 ring-8 ring-slate-50 dark:ring-slate-900/40">
            {isFiltered ? (
              <PackageX size={28} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <Package size={28} className="text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <h4 className="text-base font-heading font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            {isFiltered ? 'No matching inventory found' : 'No items registered in this room'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            {isFiltered
              ? 'None of the inventory items match your active search and filter parameters. Try clearing your filters.'
              : 'This room has no items registered yet. Click below to add your first training inventory item.'}
          </p>
          {isFiltered ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <X size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Reset Search &amp; Filters</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddItem}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Item</span>
            </button>
          )}
        </div>
      )}
      {/* Density & Pagination Bar (Ensures DOM size stays under 800 elements) */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs select-none">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>
              Showing{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                {pageSize === 'ALL' ? 1 : (safePage - 1) * pageSize + 1}
              </strong>
              {' '}to{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                {pageSize === 'ALL' ? items.length : Math.min(safePage * pageSize, items.length)}
              </strong>
              {' '}of{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                {items.length}
              </strong>
              {' '}items
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                aria-label="Rows per page"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="ALL">All ({items.length})</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Previous page"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="px-2 font-mono tabular-nums text-slate-600 dark:text-slate-300 font-semibold">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-semibold cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                title="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
