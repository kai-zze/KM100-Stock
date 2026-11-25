import React, { useState, useEffect } from "react";
import {
  Room,
  Facility,
  DEFAULT_FACILITIES,
  FacilityId,
} from "../types/inventory";
import { Trash2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingRoom: Room | null;
  onSave: (savedRoom: Room) => void;
  onDelete?: (room: Room) => void;
  defaultFacility?: string;
  facilities?: Facility[];
}

export const RoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingRoom,
  onSave,
  onDelete,
  defaultFacility = "fac-km100-stc",
  facilities = DEFAULT_FACILITIES,
}) => {
  const fallbackFacility = (facilities[0]?.id || "fac-km100-stc") as FacilityId;
  const resolvedDefault = (
    defaultFacility && defaultFacility !== "ALL"
      ? defaultFacility
      : fallbackFacility
  ) as FacilityId;

  const [name, setName] = useState(editingRoom ? editingRoom.name : "");
  const [description, setDescription] = useState(
    editingRoom ? editingRoom.description || "" : "",
  );
  const [facility, setFacility] = useState<FacilityId>(
    (editingRoom?.facility as FacilityId) || resolvedDefault,
  );
  const [error, setError] = useState("");

  // Synchronize state whenever editingRoom or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setName(editingRoom ? editingRoom.name : "");
      setDescription(editingRoom ? editingRoom.description || "" : "");
      setFacility((editingRoom?.facility as FacilityId) || resolvedDefault);
      setError("");
    }
  }, [isOpen, editingRoom, resolvedDefault]);

  // Close modal on Escape key press
  useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a room name.");
      return;
    }

    onSave({
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      facility,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
    >
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
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
                id="room-modal-title"
                className="text-sm font-heading font-bold text-slate-900 dark:text-white"
              >
                {editingRoom ? "Rename Facility Room" : "Add New Facility Room"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KM100 Enterprise Multi-Facility Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="room-facility-select"
              className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Facility Branch <span className="text-rose-500">*</span>
            </label>
            <select
              id="room-facility-select"
              value={facility}
              onChange={(e) => setFacility(e.target.value as FacilityId)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Assign this room to any registered institutional facility.
            </p>
          </div>

          <div>
            <label
              htmlFor="room-name-input"
              className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Room Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="room-name-input"
              type="text"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Purpose (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Enter room description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {editingRoom && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(editingRoom);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-colors cursor-pointer"
                title="Delete this room"
              >
                <Trash2 size={13} />
                Delete Room
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                {editingRoom ? "Save Room Name" : "Create Room"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
