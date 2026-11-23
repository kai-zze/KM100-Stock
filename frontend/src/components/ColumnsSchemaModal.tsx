import React, { useState } from "react";
import { ColumnDefinition, ColumnType } from "../types/inventory";
import {
  Sliders,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Tag,
  Sparkles,
  Check,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  onSave: (newColumns: ColumnDefinition[]) => void;
}

const CATEGORY_PRESETS: Record<string, string[]> = {
  "Bread & Pastry": [
    "Baking Equipment",
    "Baking Utensils & Pans",
    "Baking Ingredients",
    "Packaging Materials",
  ],
  "Food & Beverage": [
    "Dining Utensils & Flatware",
    "Glassware & Chinaware",
    "Bar & Beverage Supplies",
    "Table Linens",
  ],
  "Housekeeping": [
    "Cleaning Equipment",
    "Cleaning Chemicals & Sanitizers",
    "Bed Linens & Towels",
    "Guest Amenities",
  ],
  "Admin & Office": [
    "Office Supplies & Stationery",
    "Furniture & Fixtures",
    "Audio/Visual Equipment",
    "Paper & Printing",
  ],
  "Computer Systems": [
    "Tools",
    "PC Hardware and Components",
    "Peripherals and Storage",
    "Networking Equipment",
    "Cables and Connectors",
    "Diagnostic and Testing",
    "Consumables and Maintenance",
  ],
};

export const ColumnsSchemaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  columns,
  onSave,
}) => {
  const [localCols, setLocalCols] = useState<ColumnDefinition[]>(() =>
    JSON.parse(JSON.stringify(columns)),
  );
  const [newColLabel, setNewColLabel] = useState("");
  const [newColType, setNewColType] = useState<ColumnType>("text");
  const [newColOptions, setNewColOptions] = useState(
    "Option 1, Option 2, Option 3",
  );

  // Track which dropdown column has its option manager expanded (default to 'category' if available)
  const [expandedColId, setExpandedColId] = useState<string | null>(() => {
    const hasCategory = columns.some(
      (c) => c.id === "category" && c.type === "dropdown",
    );
    return hasCategory ? "category" : null;
  });

  // Inputs for adding a single option to an existing dropdown column
  const [optionInputs, setOptionInputs] = useState<Record<string, string>>({});

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
    setLocalCols((prev) => prev.filter((c) => c.id !== colId));
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
      order: localCols.length + 1,
    };

    if (newColType === "dropdown") {
      newCol.options = newColOptions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (newCol.options.length === 0) newCol.options = ["Default Option"];
    }

    setLocalCols([...localCols, newCol]);
    setNewColLabel("");
    setNewColOptions("Option 1, Option 2, Option 3");
  };

  // Add a single option to an existing dropdown column
  const handleAddSingleOption = (colId: string) => {
    const text = (optionInputs[colId] || "").trim();
    if (!text) return;

    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        const current = c.options || [];
        if (current.some((opt) => opt.toLowerCase() === text.toLowerCase())) {
          return c; // prevent duplicates
        }
        return {
          ...c,
          options: [...current, text],
        };
      }),
    );

    setOptionInputs((prev) => ({ ...prev, [colId]: "" }));
  };

  // Remove an option from a dropdown column
  const handleRemoveOption = (colId: string, optIndex: number) => {
    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        const current = [...(c.options || [])];
        current.splice(optIndex, 1);
        return { ...c, options: current };
      }),
    );
  };

  // Add preset categories to the category column
  const handleApplyPreset = (colId: string, presetName: string) => {
    const presetItems = CATEGORY_PRESETS[presetName];
    if (!presetItems) return;

    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        const current = c.options || [];
        const existingLower = new Set(current.map((x) => x.toLowerCase()));
        const toAdd = presetItems.filter(
          (x) => !existingLower.has(x.toLowerCase()),
        );
        return {
          ...c,
          options: [...current, ...toAdd],
        };
      }),
    );
  };

  const handleSave = () => {
    const reindexed = localCols.map((c, i) => ({ ...c, order: i + 1 }));
    onSave(reindexed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0">
              <Sliders size={18} />
            </div>
            <div className="min-w-0">
              <h3
                id="schema-modal-title"
                className="text-sm font-heading font-bold text-slate-900 dark:text-white truncate"
              >
                Customize Inventory Columns & Categories
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Add, rename, reorder columns, and manage Category choices across all KM100 departments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-5 text-xs flex-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Active Table Columns ({localCols.length})
              </h4>
              <span className="text-[10px] text-slate-400">
                Click &ldquo;Manage Options&rdquo; on any dropdown to customize categories & choices
              </span>
            </div>

            <div className="space-y-2.5">
              {localCols.map((col, idx) => {
                const isDropdown = col.type === "dropdown";
                const isExpanded = expandedColId === col.id;
                const optionsCount = (col.options || []).length;

                return (
                  <div
                    key={col.id}
                    className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between p-2 sm:p-2.5 gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                        <span className="w-4 sm:w-5 text-center font-mono text-slate-400 font-bold shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={col.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalCols((prev) =>
                              prev.map((c) =>
                                c.id === col.id ? { ...c, label: val } : c,
                              ),
                            );
                          }}
                          className="px-2 sm:px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 flex-1 min-w-0"
                        />
                        <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {col.type}
                        </span>
                        {col.isSystem && (
                          <span className="hidden sm:inline text-[10px] text-amber-700 dark:text-amber-400 font-semibold italic shrink-0 whitespace-nowrap">
                            Core Field
                          </span>
                        )}

                        {/* Dropdown Options Toggle Button */}
                        {isDropdown && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedColId(isExpanded ? null : col.id)
                            }
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border transition-colors shrink-0 ${
                              isExpanded
                                ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                                : "bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            }`}
                            title="Manage options list"
                          >
                            <Tag size={11} />
                            <span>
                              {col.id === "category" ? "Categories" : "Options"} ({optionsCount})
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={11} />
                            ) : (
                              <ChevronDown size={11} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Row Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveColumn(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                          title="Move Up"
                          aria-label="Move column up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveColumn(idx, 1)}
                          disabled={idx === localCols.length - 1}
                          className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                          title="Move Down"
                          aria-label="Move column down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        {!col.isSystem && (
                          <button
                            type="button"
                            onClick={() => deleteColumn(col.id)}
                            className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-0.5 sm:ml-1 transition-colors"
                            title="Delete Column"
                            aria-label="Delete column"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Dropdown Options Manager */}
                    {isDropdown && isExpanded && (
                      <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                        {/* Quick Presets for Category column */}
                        {col.id === "category" && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40">
                            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                              <Sparkles size={12} />
                              <span>Quick-Add KM100 Department Categories</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.keys(CATEGORY_PRESETS).map((pName) => (
                                <button
                                  key={pName}
                                  type="button"
                                  onClick={() => handleApplyPreset(col.id, pName)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1"
                                >
                                  <Plus size={10} />
                                  <span>{pName}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Active Options Chips / Tags */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              Active Choices ({optionsCount}):
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Click &ldquo;x&rdquo; to remove any choice
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            {(col.options || []).map((opt, oIdx) => (
                              <span
                                key={`${opt}-${oIdx}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs group hover:border-slate-300 dark:hover:border-slate-600"
                              >
                                <span>{opt}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(col.id, oIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                  title={`Remove "${opt}"`}
                                  aria-label={`Remove option ${opt}`}
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                            {(col.options || []).length === 0 && (
                              <span className="text-[11px] text-slate-400 italic">
                                No choices defined. Add one below.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add Option Form */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={
                              col.id === "category"
                                ? "Enter new category (e.g. Baking Ingredients, Linens)..."
                                : "Add new option name..."
                            }
                            value={optionInputs[col.id] || ""}
                            onChange={(e) =>
                              setOptionInputs({
                                ...optionInputs,
                                [col.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSingleOption(col.id);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSingleOption(col.id)}
                            disabled={!(optionInputs[col.id] || "").trim()}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-40 transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Custom Column Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Plus size={13} /> Add New Custom Column
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Column Label / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serial Number, Supplier, Barcode"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data Type
                </label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as ColumnType)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="text">Text (String)</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown Select</option>
                </select>
              </div>
            </div>

            {newColType === "dropdown" && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dropdown Options (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Option A, Option B, Option C"
                  value={newColOptions}
                  onChange={(e) => setNewColOptions(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddColumn}
              disabled={!newColLabel.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-40 transition-colors shadow-xs"
            >
              Insert Column to Schema
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-white dark:bg-slate-900">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Changes take effect immediately and save to institutional database
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
