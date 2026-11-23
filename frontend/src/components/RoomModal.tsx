import React, { useState, useEffect } from "react";
import { Room } from "../types/inventory";
import { Building, Trash2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingRoom: Room | null;
  onSave: (savedRoom: Room) => void;
  onDelete?: (room: Room) => void;
}

export const RoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingRoom,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(editingRoom ? editingRoom.name : "");
  const [description, setDescription] = useState(
    editingRoom ? editingRoom.description || "" : "",
  );

  // Synchronize state whenever editingRoom or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setName(editingRoom ? editingRoom.name : "");
      setDescription(editingRoom ? editingRoom.description || "" : "");
    }
  }, [isOpen, editingRoom]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
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
              src="/assets/logo.png"
              alt="KM100 Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain select-none"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/assets/favicon.png";
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
                KM100 Skills and Training Center, Inc.
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
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Room Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Lab 2, Electrical Workshop"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="e.g. Dedicated practical lab for network certification courses"
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
