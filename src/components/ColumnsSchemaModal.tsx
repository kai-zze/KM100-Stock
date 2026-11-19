import React, { useState } from 'react';
import { ColumnDefinition, ColumnType } from '../types/inventory';
import { Sliders, X, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  onSave: (newColumns: ColumnDefinition[]) => void;
}

export const ColumnsSchemaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  columns,
  onSave
}) => {
  const [localCols, setLocalCols] = useState<ColumnDefinition[]>(() =>
    JSON.parse(JSON.stringify(columns))
  );
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<ColumnType>('text');
  const [newColOptions, setNewColOptions] = useState('Option 1, Option 2, Option 3');

  if (!isOpen) return null;

  const moveColumn = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= localCols.length) return;
    const copy = [...localCols];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setLocalCols(copy);
  };

  const deleteColumn = (colId: string) => {
    setLocalCols(prev => prev.filter(c => c.id !== colId));
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    const id = `custom_${Date.now()}`;
    const newCol: ColumnDefinition = {
      id,
      label: newColLabel.trim(),
      type: newColType,
      required: false,
      isSystem: false,
      order: localCols.length + 1
    };

    if (newColType === 'dropdown') {
      newCol.options = newColOptions
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (newCol.options.length === 0) newCol.options = ['Default Option'];
    }

    setLocalCols([...localCols, newCol]);
    setNewColLabel('');
    setNewColOptions('Option 1, Option 2, Option 3');
  };

  const handleSave = () => {
    const reindexed = localCols.map((c, i) => ({ ...c, order: i + 1 }));
    onSave(reindexed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sliders size={18} />
            </div>
            <div>
              <h3 id="schema-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Customize Inventory Columns (Schema Builder)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dynamically add, rename, reorder, and configure table & export columns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              Active Table Columns ({localCols.length})
            </h4>
            <div className="space-y-2">
              {localCols.map((col, idx) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={col.label}
                      onChange={e => {
                        const val = e.target.value;
                        setLocalCols(prev =>
                          prev.map(c => (c.id === col.id ? { ...c, label: val } : c))
                        );
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex-1 max-w-[200px]"
                    />
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {col.type}
                    </span>
                    {col.isSystem && (
                      <span className="text-[10px] text-slate-400 italic">System Field</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveColumn(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveColumn(idx, 1)}
                      disabled={idx === localCols.length - 1}
                      className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown size={13} />
                    </button>
                    {!col.isSystem && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(col.id)}
                        className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                        title="Delete Column"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Column Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Plus size={13} /> Add New Custom Column
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Column Label / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serial Number, Supplier, Barcode"
                  value={newColLabel}
                  onChange={e => setNewColLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data Type
                </label>
                <select
                  value={newColType}
                  onChange={e => setNewColType(e.target.value as ColumnType)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="text">Text (String)</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown Select</option>
                </select>
              </div>
            </div>

            {newColType === 'dropdown' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dropdown Options (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In Stock, Out of Stock, On Order"
                  value={newColOptions}
                  onChange={e => setNewColOptions(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddColumn}
              disabled={!newColLabel.trim()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors"
            >
              Insert Column to Schema
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            Save Column Layout
          </button>
        </div>
      </div>
    </div>
  );
};
