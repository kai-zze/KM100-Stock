import React, { useState } from "react";
import { ColumnDefinition, ColumnType } from "../types/inventory";
import {
  Sliders,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Check,
  Tag,
  Edit2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  onSave: (newColumns: ColumnDefinition[]) => void;
}

const DEFAULT_CATEGORY_OPTIONS = [
  "Tools",
  "Consumables and Maintenance",
  "Peripherals and Storage",
  "PC Hardware and Components",
  "Diagnostic and Testing",
  "Cables and Connectors",
  "Networking Equipment",
  "Operating System and Software",
  "Books and References",
];

const DEFAULT_UNIT_OPTIONS = ["pcs", "case", "box", "bag", "set", "roll"];
const DEFAULT_STATUS_OPTIONS = [
  "Working",
  "Empty",
  "Defective",
  "Used",
  "Incomplete",
];

const ensureColumnOptions = (cols: ColumnDefinition[]): ColumnDefinition[] => {
  return cols.map((col) => {
    if (col.type === "dropdown" && (!col.options || col.options.length === 0)) {
      if (col.id === "category") {
        return { ...col, options: [...DEFAULT_CATEGORY_OPTIONS] };
      }
      if (col.id === "units") {
        return { ...col, options: [...DEFAULT_UNIT_OPTIONS] };
      }
      if (col.id === "status" || col.id === "condition") {
        return { ...col, options: [...DEFAULT_STATUS_OPTIONS] };
      }
      return { ...col, options: ["Option 1", "Option 2", "Option 3"] };
    }
    return { ...col };
  });
};

export const ColumnsSchemaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  columns,
  onSave,
}) => {
  const [localCols, setLocalCols] = useState<ColumnDefinition[]>(() =>
    ensureColumnOptions(JSON.parse(JSON.stringify(columns))),
  );
  const [expandedColId, setExpandedColId] = useState<string | null>(null);
  const [bulkEditColId, setBulkEditColId] = useState<string | null>(null);
  const [bulkEditText, setBulkEditText] = useState("");
  const [newOptionInputs, setNewOptionInputs] = useState<
    Record<string, string>
  >({});

  const [newColLabel, setNewColLabel] = useState("");
  const [newColType, setNewColType] = useState<ColumnType>("text");
  const [newColOptions, setNewColOptions] = useState(
    "Option 1, Option 2, Option 3",
  );

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);
  const [newColRequired, setNewColRequired] = useState(false);

  if (!isOpen) return null;

  // ── Column Order & Movement ──
  const moveColumn = (index: number, direction: number) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= localCols.length) return;
    const copy = [...localCols];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setLocalCols(copy);
  };

  // ── Column CRUD ──
  const updateColumnLabel = (colId: string, label: string) => {
    setLocalCols((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, label } : c)),
    );
  };

  const updateColumnType = (colId: string, newType: ColumnType) => {
    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        const updated: ColumnDefinition = { ...c, type: newType };
        if (
          newType === "dropdown" &&
          (!updated.options || updated.options.length === 0)
        ) {
          updated.options = ["Default Option 1", "Default Option 2"];
        }
        return updated;
      }),
    );
  };

  const toggleColumnRequired = (colId: string) => {
    setLocalCols((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, required: !c.required } : c)),
    );
  };

  const deleteColumn = (colId: string) => {
    setLocalCols((prev) => prev.filter((c) => c.id !== colId));
    if (expandedColId === colId) setExpandedColId(null);
  };

  // ── Column Dropdown Options (Content CRUD) ──
  const addOptionToColumn = (colId: string) => {
    const optVal = (newOptionInputs[colId] || "").trim();
    if (!optVal) return;

    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        const currentOpts = c.options ? [...c.options] : [];
        if (currentOpts.includes(optVal)) return c; // prevent duplicates
        return { ...c, options: [...currentOpts, optVal] };
      }),
    );

    setNewOptionInputs((prev) => ({ ...prev, [colId]: "" }));
  };

  const updateOptionInColumn = (
    colId: string,
    optionIndex: number,
    newOptionValue: string,
  ) => {
    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId || !c.options) return c;
        const newOptions = [...c.options];
        newOptions[optionIndex] = newOptionValue;
        return { ...c, options: newOptions };
      }),
    );
  };

  const deleteOptionFromColumn = (colId: string, optionIndex: number) => {
    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId || !c.options) return c;
        if (c.options.length <= 1) return c; // keep at least 1 option
        const newOptions = c.options.filter((_, idx) => idx !== optionIndex);
        return { ...c, options: newOptions };
      }),
    );
  };

  const openBulkEdit = (col: ColumnDefinition) => {
    setBulkEditColId(col.id);
    setBulkEditText((col.options || []).join(", "));
  };

  const applyBulkEdit = (colId: string) => {
    const parsedOptions = bulkEditText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setLocalCols((prev) =>
      prev.map((c) => {
        if (c.id !== colId) return c;
        return {
          ...c,
          options:
            parsedOptions.length > 0 ? parsedOptions : ["Default Option"],
        };
      }),
    );
    setBulkEditColId(null);
  };

  // ── Add New Custom Column ──
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    const id = `custom_${Date.now()}`;
    const newCol: ColumnDefinition = {
      id,
      label: newColLabel.trim(),
      type: newColType,
      required: newColRequired,
      isSystem: false,
      order: localCols.length + 1,
    };

    if (newColType === "dropdown") {
      newCol.options = newColOptions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (newCol.options.length === 0)
        newCol.options = ["Option 1", "Option 2"];
    }

    setLocalCols([...localCols, newCol]);
    setNewColLabel("");
    setNewColOptions("Option 1, Option 2, Option 3");
    setNewColRequired(false);
    setExpandedColId(id); // auto-expand newly added column
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
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shrink-0">
              <Sliders size={18} />
            </div>
            <div className="min-w-0">
              <h3
                id="schema-modal-title"
                className="text-sm font-heading font-bold text-slate-900 dark:text-white truncate"
              >
                Customize Inventory Columns &amp; Content (Schema Builder)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Configure field labels, data types, dropdown content choices,
                and validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-5 text-xs flex-1">
          {/* Active Columns List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Active Table Columns ({localCols.length})
              </h4>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Click "Options" on any column to edit choices or data types
              </span>
            </div>

            <div className="space-y-2.5">
              {localCols.map((col, idx) => {
                const isExpanded = expandedColId === col.id;
                const options = col.options || [];

                return (
                  <div
                    key={col.id}
                    className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                      isExpanded
                        ? "border-amber-500/70 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {/* Summary Row */}
                    <div className="flex items-center justify-between p-2.5 sm:p-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-5 text-center font-mono text-slate-400 font-bold shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={col.label}
                          aria-label={`Column ${idx + 1} label`}
                          onChange={(e) =>
                            updateColumnLabel(col.id, e.target.value)
                          }
                          className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 flex-1 min-w-[120px]"
                        />
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider shrink-0 ${
                            col.type === "dropdown"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800"
                              : col.type === "number"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {col.type}
                        </span>
                        {col.type === "dropdown" && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            ({options.length} choices)
                          </span>
                        )}
                        {col.isSystem && (
                          <span className="hidden md:inline text-[10px] text-amber-700 dark:text-amber-400 font-semibold italic shrink-0 whitespace-nowrap">
                            Core Field
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedColId(isExpanded ? null : col.id)
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isExpanded
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title="Configure column options and settings"
                        >
                          <Sliders size={12} />
                          <span>Configure</span>
                          <ChevronDown
                            size={12}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveColumn(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveColumn(idx, 1)}
                          disabled={idx === localCols.length - 1}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown size={13} />
                        </button>

                        {!col.isSystem && (
                          <button
                            type="button"
                            onClick={() => deleteColumn(col.id)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-0.5 transition-colors cursor-pointer"
                            title="Delete Column"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content Configuration Drawer */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-3 sm:p-4 space-y-4">
                        {/* Type & Validation Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Field Data Type
                            </label>
                            <div className="flex items-center gap-1.5">
                              {(
                                ["text", "number", "dropdown"] as ColumnType[]
                              ).map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => updateColumnType(col.id, t)}
                                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                                    col.type === t
                                      ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!col.required}
                                onChange={() => toggleColumnRequired(col.id)}
                                className="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
                              />
                              <span>
                                Mandatory field (Required during entry)
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Dropdown Options CRUD (Content Management) */}
                        {col.type === "dropdown" ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Tag
                                  size={13}
                                  className="text-amber-700 dark:text-amber-400"
                                />
                                Dropdown Choices Content ({options.length})
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  bulkEditColId === col.id
                                    ? setBulkEditColId(null)
                                    : openBulkEdit(col)
                                }
                                className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                              >
                                {bulkEditColId === col.id
                                  ? "← Return to Tag List"
                                  : "Quick Comma-separated Edit"}
                              </button>
                            </div>

                            {bulkEditColId === col.id ? (
                              <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/60">
                                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                  Edit choices as comma-separated list:
                                </label>
                                <textarea
                                  rows={3}
                                  value={bulkEditText}
                                  onChange={(e) =>
                                    setBulkEditText(e.target.value)
                                  }
                                  className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                  placeholder="Option 1, Option 2, Option 3..."
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setBulkEditColId(null)}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyBulkEdit(col.id)}
                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-700 text-white hover:bg-amber-800 shadow-xs"
                                  >
                                    Apply Choices
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Add Option Input */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Type new option choice and click Add..."
                                    value={newOptionInputs[col.id] || ""}
                                    onChange={(e) =>
                                      setNewOptionInputs({
                                        ...newOptionInputs,
                                        [col.id]: e.target.value,
                                      })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addOptionToColumn(col.id);
                                      }
                                    }}
                                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => addOptionToColumn(col.id)}
                                    disabled={
                                      !(newOptionInputs[col.id] || "").trim()
                                    }
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-40 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={13} />
                                    <span>Add Choice</span>
                                  </button>
                                </div>

                                {/* Options List */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                  {options.map((opt, optIdx) => (
                                    <div
                                      key={`${col.id}-opt-${optIdx}`}
                                      className="flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xs group"
                                    >
                                      <input
                                        type="text"
                                        value={opt}
                                        aria-label={`Option ${optIdx + 1}`}
                                        onChange={(e) =>
                                          updateOptionInColumn(
                                            col.id,
                                            optIdx,
                                            e.target.value,
                                          )
                                        }
                                        className="flex-1 px-1.5 py-0.5 text-xs bg-transparent border-0 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteOptionFromColumn(col.id, optIdx)
                                        }
                                        disabled={options.length <= 1}
                                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors cursor-pointer"
                                        title={
                                          options.length <= 1
                                            ? "Minimum 1 option required"
                                            : "Delete option choice"
                                        }
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                            This column stores{" "}
                            {col.type === "number"
                              ? "numeric values"
                              : "freeform text strings"}
                            . To specify fixed choices or categories, change its
                            data type to{" "}
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              Dropdown
                            </span>{" "}
                            above.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Custom Column Section */}
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Plus size={13} /> Add New Custom Column to Schema
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
                  onChange={(e) => setNewColLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
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
                  Initial Choices (comma-separated)
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newColRequired}
                  onChange={(e) => setNewColRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
                />
                <span>Required field during item entry</span>
              </label>

              <button
                type="button"
                onClick={handleAddColumn}
                disabled={!newColLabel.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-40 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Insert Column to Schema</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-50/70 dark:bg-slate-800/40">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Changes will update item forms, excel workbooks, and table views
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Save Column Layout &amp; Content</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
