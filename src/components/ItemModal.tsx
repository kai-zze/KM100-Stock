import React, { useState } from "react";
import {
  ColumnDefinition,
  InventoryItem,
  Room,
  Facility,
  DEFAULT_FACILITIES,
  DEFAULT_FACILITY_ID,
  normalizeFacilityId,
} from "../types/inventory";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingItem: InventoryItem | null;
  columns: ColumnDefinition[];
  rooms: Room[];
  selectedRoomId: string;
  onSave: (savedItem: InventoryItem) => void;
  facilities?: Facility[];
}

export const ItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingItem,
  columns,
  rooms,
  selectedRoomId,
  onSave,
  facilities = DEFAULT_FACILITIES,
}) => {
  const [formError, setFormError] = useState("");

  const getInitialFormData = React.useCallback(
    (item: InventoryItem | null) => {
      const currentRoom =
        selectedRoomId !== "ALL"
          ? selectedRoomId
          : item?.roomId || rooms[0]?.id || "";
      if (item && item.id) {
        const cond = item.status || item.condition || "Working";
        const initial: Record<string, any> = {
          ...item,
          status: cond,
          condition: cond,
          deployedTo: item.deployedTo || item.deployedLocation || "",
          deployedLocation: item.deployedLocation || item.deployedTo || "",
        };
        columns.forEach((col) => {
          if (initial[col.id] === undefined) {
            initial[col.id] =
              item[col.id] !== undefined
                ? item[col.id]
                : item.custom_fields?.[col.id] !== undefined
                  ? item.custom_fields[col.id]
                  : col.type === "number"
                    ? 0
                    : "";
          }
        });
        return initial;
      }
      const initial: Record<string, any> = {
        roomId: currentRoom,
        name: "",
        quantity: 1,
        units: "pcs",
        status: "Working",
        condition: "Working",
        category: "Tools",
        remarks: "",
        deployedTo: "",
        deployedLocation: "",
      };
      columns.forEach((col) => {
        if (initial[col.id] === undefined) {
          initial[col.id] = col.type === "number" ? 0 : "";
        }
      });
      return initial;
    },
    [columns, rooms, selectedRoomId],
  );

  const [formData, setFormData] = useState<Record<string, any>>(() =>
    getInitialFormData(editingItem),
  );

  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(editingItem));
      setFormError("");
    }
  }, [editingItem, isOpen, getInitialFormData]);

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingItem && editingItem.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormError("Item Name is required.");
      return;
    }
    if (!formData.roomId) {
      setFormError("Please select a facility room.");
      return;
    }

    for (const col of columns) {
      if (col.required) {
        const val = formData[col.id];
        if (col.type === "number") {
          if (
            val === "" ||
            val === undefined ||
            val === null ||
            Number(val) < 0
          ) {
            setFormError(`${col.label} must be a non-negative number.`);
            return;
          }
        } else if (!String(val ?? "").trim()) {
          setFormError(`${col.label} is required.`);
          return;
        }
      }
    }

    const now = new Date().toISOString();
    const targetRoom = rooms.find((r) => r.id === formData.roomId);
    const cond = formData.status || formData.condition || "Working";

    const payload: InventoryItem = {
      ...formData,
      id: isEditing && editingItem ? editingItem.id : `item-${Date.now()}`,
      name: formData.name.trim(),
      roomId: formData.roomId,
      room: targetRoom?.name || formData.room || "",
      facility: normalizeFacilityId(
        targetRoom?.facility || formData.facility || DEFAULT_FACILITY_ID,
        facilities,
      ),
      category: formData.category || "General",
      status: cond,
      condition: cond,
      quantity: Math.max(0, Number(formData.quantity) || 0),
      updatedAt: now,
      createdAt: (isEditing && editingItem?.createdAt) || now,
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
              src="/logo-sm.png"
              alt="KM100 Logo"
              width={36}
              height={36}
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
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4 text-xs"
        >
          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {formError}
            </div>
          )}
          <div>
            <label
              htmlFor="item-room-select"
              className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Target Facility Room <span className="text-rose-500">*</span>
            </label>
            <select
              id="item-room-select"
              value={formData.roomId}
              onChange={(e) =>
                setFormData({ ...formData, roomId: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white font-medium"
              required
            >
              {facilities.map((facility) => {
                const facilityRooms = rooms.filter(
                  (r) =>
                    normalizeFacilityId(r.facility, facilities) === facility.id,
                );
                if (facilityRooms.length === 0) return null;
                return (
                  <optgroup key={facility.id} label={facility.name}>
                    {facilityRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              {(() => {
                const knownFacIds = new Set(facilities.map((f) => f.id));
                const unassigned = rooms.filter(
                  (r) =>
                    !knownFacIds.has(
                      normalizeFacilityId(r.facility, facilities),
                    ),
                );
                if (unassigned.length === 0) return null;
                return (
                  <optgroup label="Other Rooms">
                    {unassigned.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })()}
            </select>
          </div>

          {columns.map((col) => {
            const val = formData[col.id] !== undefined ? formData[col.id] : "";

            if (col.type === "dropdown") {
              let options =
                col.options && col.options.length > 0
                  ? [...col.options]
                  : col.id === "status" || col.id === "condition"
                    ? ["Working", "Used", "Defective", "Empty", "Incomplete"]
                    : col.id === "units"
                      ? ["pcs", "set", "box", "roll", "pack"]
                      : [
                          "Tools",
                          "Deployed",
                          "PC Hardware",
                          "Peripheral",
                          "Cables and Wires",
                          "Consumables",
                          "Diagnostic",
                          "Networking",
                        ];

              if (
                col.id === "category" &&
                !options.includes("Deployed") &&
                !options.includes("Deploy")
              ) {
                options = ["Deployed", ...options];
              }

              if (
                (col.id === "status" || col.id === "condition") &&
                !options.includes("Deployed") &&
                !options.includes("Deploy")
              ) {
                options = [
                  "Working",
                  "Deployed",
                  ...options.filter((o) => o !== "Working"),
                ];
              }

              return (
                <div key={col.id}>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {col.label}{" "}
                    {col.required && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    value={val}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      if (col.id === "status" || col.id === "condition") {
                        setFormData({
                          ...formData,
                          status: nextVal,
                          condition: nextVal,
                          [col.id]: nextVal,
                        });
                      } else {
                        setFormData({ ...formData, [col.id]: nextVal });
                      }
                    }}
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
                          e.target.value === ""
                            ? ""
                            : Math.max(0, Number(e.target.value) || 0),
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
              className="px-4 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              {isEditing ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
