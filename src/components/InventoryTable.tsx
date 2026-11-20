import React from 'react';
import {
  ColumnDefinition,
  InventoryItem,
  Room
} from '../types/inventory';
import { ConditionBadge } from './ConditionBadge';
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  Building,
  Package,
  Tag
} from 'lucide-react';

interface Props {
  /** Items on the current page. */
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
  onPrintAssetTag: (item: InventoryItem) => void;
  onAddItem: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalItemsInCatalog: number;
  totalFilteredCount: number;
  totalFilteredUnits: number;
  selectedIds: string[];
  onToggleSelect: (itemId: string) => void;
  onToggleSelectPage: (itemIds: string[], select: boolean) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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
  onPrintAssetTag,
  onAddItem,
  onResetFilters,
  isFiltered,
  totalItemsInCatalog,
  totalFilteredCount,
  totalFilteredUnits,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  page,
  pageSize,
  totalPages,
  onPageChange
}) => {
  const pageIds = items.map((item) => item.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.indexOf(id) !== -1);
  const someOnPageSelected =
    !allOnPageSelected && pageIds.some((id) => selectedIds.indexOf(id) !== -1);

  const setHeaderCheckbox = (node: HTMLInputElement | null) => {
    if (node) node.indeterminate = someOnPageSelected;
  };

  const rangeStart = totalFilteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFilteredCount);

  return (
    <div className="flex-1 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div className="flex-1 overflow-x-auto overflow-y-auto overscroll-contain [webkit-overflow-scrolling:touch]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur border-b border-slate-200 z-10">
            <tr>
              <th className="py-3 pl-4 pr-1 w-9">
                <input
                  ref={setHeaderCheckbox}
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={(e) => onToggleSelectPage(pageIds, e.target.checked)}
                  aria-label="Select all items on this page"
                  className="rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                />
              </th>

              {selectedRoomId === 'ALL' && (
                <th className="py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Room Location
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.id}
                  onClick={() => onSort(col.id)}
                  aria-sort={
                    sortField === col.id
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className="py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-[11px] cursor-pointer hover:bg-slate-100/60 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {sortField === col.id ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp size={13} className="text-amber-700" />
                      ) : (
                        <ChevronDown size={13} className="text-amber-700" />
                      )
                    ) : (
                      <ArrowUpDown
                        size={11}
                        className="text-slate-400 opacity-40 hover:opacity-100"
                      />
                    )}
                  </div>
                </th>
              ))}

              <th className="py-3 px-4 font-bold text-slate-600 uppercase tracking-wider text-[11px] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const itemRoom = rooms.find((room) => room.id === item.roomId);
              const isSelected = selectedIds.indexOf(item.id) !== -1;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors group ${
                    isSelected ? 'bg-amber-50/70' : 'hover:bg-amber-50/40'
                  }`}
                >
                  <td className="py-3 pl-4 pr-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      aria-label={`Select ${item.name}`}
                      className="rounded border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                    />
                  </td>

                  {selectedRoomId === 'ALL' && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectRoom(item.roomId)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800 cursor-pointer transition-colors"
                        title="Jump to this room"
                      >
                        <Building size={12} className="text-amber-700" />
                        {itemRoom?.name || 'Unassigned'}
                      </button>
                    </td>
                  )}

                  {columns.map((col) => {
                    const val = item[col.id];

                    if (col.id === 'condition' || col.id === 'status') {
                      return (
                        <td key={col.id} className="py-3 px-4 whitespace-nowrap">
                          <ConditionBadge
                            condition={val || item.status || item.condition || 'Working'}
                          />
                        </td>
                      );
                    }

                    if (col.id === 'quantity') {
                      const numVal = Number(val) || 0;
                      return (
                        <td key={col.id} className="py-3 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-inner">
                            <button
                              onClick={() => onQuantityChange(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm disabled:opacity-40"
                              disabled={numVal <= 0}
                              title="Decrease quantity by 1"
                            >
                              <Minus size={12} />
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
                              className="w-12 px-1 py-0.5 text-center font-mono font-bold tabular-nums text-xs text-slate-900 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                              onClick={() => onQuantityChange(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-sm"
                              title="Increase quantity by 1"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={col.id} className="py-3 px-4">
                        {col.id === 'name' ? (
                          <span className="font-semibold text-slate-900">{val || '—'}</span>
                        ) : col.id === 'category' ? (
                          <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                            {val || '—'}
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            {val !== undefined && val !== null && val !== ''
                              ? String(val)
                              : '—'}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onPrintAssetTag(item)}
                        aria-label={`Print asset tag for ${item.name}`}
                        className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Print Asset Tag Sticker"
                      >
                        <Tag size={14} />
                      </button>
                      <button
                        onClick={() => onEditItem(item)}
                        aria-label={`Edit ${item.name}`}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalFilteredCount > 0 && (
        <div className="py-2.5 px-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <span>
              Showing{' '}
              <strong className="text-slate-900 font-mono">
                {rangeStart}–{rangeEnd}
              </strong>{' '}
              of <strong className="text-slate-900 font-mono">{totalFilteredCount}</strong> items
              <span className="text-slate-400">
                {' '}
                (catalog: <span className="font-mono">{totalItemsInCatalog}</span>)
              </span>
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 ml-2">
                <button
                  disabled={page <= 1}
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  aria-label="Previous page"
                  className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-100"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="font-mono text-[11px] px-1">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  aria-label="Next page"
                  className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-100"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="font-mono">
            Filtered Subtotal:{' '}
            <strong className="text-emerald-600">{totalFilteredUnits}</strong> units
          </div>
        </div>
      )}

      {totalFilteredCount === 0 && (
        <div className="py-16 px-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Package size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">No Inventory Items Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {isFiltered
              ? 'No items match your active search and filter parameters. Try clearing your filters.'
              : 'This room has no items registered yet. Click below to add your first training inventory item.'}
          </p>
          {isFiltered ? (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Clear Search &amp; Filters
            </button>
          ) : (
            <button
              onClick={onAddItem}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm"
            >
              Add New Item
            </button>
          )}
        </div>
      )}
    </div>
  );
};
