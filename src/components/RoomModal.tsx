import React, { useState } from 'react';
import { Room } from '../types/inventory';
import { Building, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingRoom: Room | null;
  onSave: (savedRoom: Room) => void;
}

export const RoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingRoom,
  onSave
}) => {
  const [name, setName] = useState(editingRoom ? editingRoom.name : '');
  const [description, setDescription] = useState(editingRoom ? editingRoom.description || '' : '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      name: name.trim(),
      description: description.trim()
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="KM100 Logo"
              className="w-9 h-9 object-contain rounded-full bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "./logo.png";
              }}
            />
            <div>
              <h3 id="room-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                {editingRoom ? 'Rename Facility Room' : 'Add New Facility Room'}
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Room Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Lab 2, Electrical Workshop"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </div>

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
              className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98]"
            >
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
