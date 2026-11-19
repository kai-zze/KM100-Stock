import React from 'react';
import { ColumnDefinition, InventoryItem, Room } from '../types/inventory';
import { ConditionBadge } from './ConditionBadge';
import { ArrowUpDown, ChevronUp, ChevronDown, Plus, Minus, Edit, Trash2, Building, Package } from 'lucide-react';

interface Props {
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
  totalItemsInCatalog: number;
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
  totalItemsInCatalog
}) => {
  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div className="flex-1 overflow-x-auto overflow-y-auto overscroll-contain [webkit-overflow-scrolling:touch]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              {selectedRoomId === 'ALL' && (
                <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Room Location
                </th>
              )}

              {columns.map(col => (
                <th
                  key={col.id}
                  onClick={() => onSort(col.id)}
                  aria-sort={sortField === col.id ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {sortField === col.id ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp size={13} className="text-blue-600" />
                      ) : (
                        <ChevronDown size={13} className="text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown size={11} className="text-slate-400 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>
              ))}

              <th className="py-3 px-4 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map(item => {
              const itemRoom = rooms.find(r => r.id === item.roomId);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                >
                  {selectedRoomId === 'ALL' && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        onClick={() => onSelectRoom(item.roomId)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors"
                        title="Jump to this room"
                      >
                        <Building size={12} className="text-blue-500" />
                        {itemRoom?.name || 'Unassigned'}
                      </span>
                    </td>
                  )}

                  {columns.map(col => {
                    const val = item[col.id];

                    if (col.id === 'condition' || col.id === 'status') {
                      return (
                        <td key={col.id} className="py-3 px-4 whitespace-nowrap">
                          <ConditionBadge condition={val || item.status || item.condition || 'Working'} />
                        </td>
                      );
                    }

                    if (col.id === 'quantity') {
                      const numVal = Number(val) || 0;
                      return (
                        <td key={col.id} className="py-3 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1 shadow-inner">
                            <button
                              onClick={() => onQuantityChange(item.id, -1)}
                              aria-label={`Decrease quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors shadow-sm disabled:opacity-40"
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
                              className="w-12 px-1 py-0.5 text-center font-mono font-bold tabular-nums text-xs text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-orange-500 rounded transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                              onClick={() => onQuantityChange(item.id, 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 transition-colors shadow-sm"
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
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {val || '—'}
                          </span>
                        ) : col.id === 'category' ? (
                          <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {val || '—'}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">
                            {val !== undefined && val !== null && val !== '' ? String(val) : '—'}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditItem(item)}
                        aria-label={`Edit ${item.name}`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
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

      {/* Footer */}
      <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <strong className="text-slate-900 dark:text-white font-mono">{items.length}</strong> of{' '}
          <span className="font-mono">{totalItemsInCatalog}</span> total items
        </div>
        <div className="font-mono">
          Filtered Subtotal:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0)}
          </strong>{' '}
          units
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="py-16 px-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Package size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Inventory Items Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {isFiltered
              ? 'No items match your active search and filter parameters. Try clearing your filters.'
              : 'This room has no items registered yet. Click below to add your first training inventory item.'}
          </p>
          {isFiltered ? (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            >
              Clear Search & Filters
            </button>
          ) : (
            <button
              onClick={onAddItem}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Add New Item
            </button>
          )}
        </div>
      )}
    </div>
  );
};
