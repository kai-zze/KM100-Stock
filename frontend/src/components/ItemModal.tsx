import React, { useState } from "react";
import { ColumnDefinition, InventoryItem, Room } from "../types/inventory";
import { Plus, Edit2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: InventoryItem | null;
  columns: ColumnDefinition[];
  rooms: Room[];
  selectedRoomId: string;
  onSave: (savedItem: InventoryItem) => void;
}

export const ItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingItem,
  columns,
  rooms,
  selectedRoomId,
  onSave,
}) => {
  const defaultRoom =
    selectedRoomId !== "ALL" ? selectedRoomId : rooms[0]?.id || "";

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (editingItem) {
      return { ...editingItem };
    }
    const initial: Record<string, any> = {
      roomId: defaultRoom,
      name: "",
      quantity: 1,
      units: "pcs",
      status: "Working",
      condition: "Working",
      category: "Tools",
      remarks: "",
    };
    columns.forEach((col) => {
      if (initial[col.id] === undefined) {
        initial[col.id] = col.type === "number" ? 0 : "";
      }
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Item Name is required.");
      return;
    }
    if (!formData.roomId) {
      alert("Please select a facility room.");
      return;
    }

    const now = new Date().toISOString();
    const payload: InventoryItem = {
      ...formData,
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: formData.name.trim(),
      roomId: formData.roomId,
      category: formData.category || "General",
      condition: formData.condition || "Good",
      quantity: Number(formData.quantity) || 0,
      updatedAt: now,
      createdAt: editingItem?.createdAt || now,
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="./logo.png"
              alt="KM100 Logo"
              className="w-9 h-9 object-contain select-none"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/favicon.png";
              }}
            />
            <div>
              <h3
                id="item-modal-title"
                className="text-sm font-heading font-bold text-slate-900 dark:text-white"
              >
                {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KM100 Skills and Training Center, Inc.
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

        {/* Dynamic Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Facility Room <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.roomId}
              onChange={(e) =>
                setFormData({ ...formData, roomId: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-medium"
              required
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {columns.map((col) => {
            const val = formData[col.id] !== undefined ? formData[col.id] : "";

            if (col.type === "dropdown") {
              const options =
                col.options && col.options.length > 0
                  ? col.options
                  : col.id === "status" || col.id === "condition"
                    ? ["Working", "Used", "Defective", "Empty", "Incomplete"]
                    : col.id === "units"
                      ? ["pcs", "set", "box", "roll", "pack"]
                      : [
                          "Tools",
                          "PC Hardware",
                          "Peripheral",
                          "Cables and Wires",
                          "Consumables",
                          "Diagnostic",
                          "Networking",
                        ];
              return (
                <div key={col.id}>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {col.label}{" "}
                    {col.required && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    value={val}
                    onChange={(e) =>
                      setFormData({ ...formData, [col.id]: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-medium"
                    required={col.required}
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (col.type === "number") {
              return (
                <div key={col.id}>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {col.label}{" "}
                    {col.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={val}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [col.id]:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white tabular-nums"
                    required={col.required}
                  />
                </div>
              );
            }

            return (
              <div key={col.id}>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {col.label}{" "}
                  {col.required && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={`Enter ${col.label.toLowerCase()}...`}
                  value={val}
                  onChange={(e) =>
                    setFormData({ ...formData, [col.id]: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white"
                  required={col.required}
                />
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              {editingItem ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
