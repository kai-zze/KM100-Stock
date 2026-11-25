import React, { useState, useEffect } from "react";
import { Facility } from "../types/inventory";
import { Building, Trash2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingFacility: Facility | null;
  onSave: (savedFacility: Facility) => void;
  onDelete?: (facility: Facility) => void;
}

const DEFAULT_BADGE_CLASS =
  "text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800";

export const FacilityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingFacility,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(editingFacility ? editingFacility.name : "");
  const [description, setDescription] = useState(
    editingFacility ? editingFacility.description : "",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(editingFacility ? editingFacility.name : "");
      setDescription(editingFacility ? editingFacility.description : "");
      setError("");
    }
  }, [isOpen, editingFacility]);

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
      setError("Please enter a facility name.");
      return;
    }

    const trimmedCode = (
      editingFacility?.code ||
      name
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 4) ||
      "FAC"
    ).toUpperCase();
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const facilityId =
      editingFacility?.id ||
      `fac-${slug || "branch"}-${Date.now().toString(36)}`;

    onSave({
      id: facilityId,
      name: name.trim(),
      shortName: name.trim().slice(0, 12),
      code: trimmedCode,
      fullName: name.trim(),
      description: description.trim() || "Facility property custody register",
      badgeClass: editingFacility?.badgeClass || DEFAULT_BADGE_CLASS,
      isSystem: editingFacility?.isSystem || false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-modal-title"
    >
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-900/60">
              <Building size={20} />
            </div>
            <div>
              <h3
                id="facility-modal-title"
                className="text-sm font-heading font-bold text-slate-900 dark:text-white"
              >
                {editingFacility ? "Edit Facility Branch" : "Add New Facility"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                KM100 Enterprise Multi-Facility Architecture
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

        {/* Form */}
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
              htmlFor="facility-name-input"
              className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Facility Official Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="facility-name-input"
              type="text"
              placeholder="Enter facility name"
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
              Description / Facility Scope (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Enter facility description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {editingFacility && onDelete && !editingFacility.isSystem ? (
              <button
                type="button"
                onClick={() => onDelete(editingFacility)}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {editingFacility ? "Save Changes" : "Create Facility"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
