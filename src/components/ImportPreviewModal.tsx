import React from "react";
import { FileSpreadsheet, X, Plus, Folder, Trash2 } from "lucide-react";
import { Room } from "../types/inventory";
import type { ImportAnalysis } from "../utils/importParse";
import { ConditionBadge } from "./ConditionBadge";

interface Props {
  analysis: ImportAnalysis;
  currentRoom?: Room;
  onCancel: () => void;
  onImportDirect: () => void;
  onImportCurrentRoom: () => void;
  onReplaceAll: () => void;
}

export const ImportPreviewModal: React.FC<Props> = ({
  analysis,
  currentRoom,
  onCancel,
  onImportDirect,
  onImportCurrentRoom,
  onReplaceAll,
}) => {
  const roomChipCount = analysis.roomsList.length;
  const targetLabel = currentRoom
    ? currentRoom.name.length > 18
      ? `${currentRoom.name.slice(0, 16)}...`
      : currentRoom.name
    : "First Room";

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[calc(100dvh-2rem)] flex flex-col">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3
                id="import-modal-title"
                className="text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>Spreadsheet Converted</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {analysis.totalItems} items ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {analysis.fileName}
                {analysis.fileSize ? ` — ${analysis.fileSize}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close import preview"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="font-semibold">Detected Facility Rooms:</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {roomChipCount} facility(ies)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.roomsList.length === 0 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  No room column found — items will use the target room.
                </span>
              )}
              {analysis.roomsList.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <span>{name}</span>
                  <strong className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[10px]">
                    {(analysis.roomCounts[name] || 0).toLocaleString()}
                  </strong>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Sample Converted Items:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Showing top {analysis.samplePreview.length} of{" "}
                {analysis.totalItems.toLocaleString()}
              </span>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Assigned Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysis.samplePreview.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-2 font-medium text-slate-900 dark:text-slate-100 max-w-[170px] truncate">
                        {item.name}
                      </td>
                      <td className="p-2 text-slate-500 dark:text-slate-400">
                        {item.category}
                      </td>
                      <td className="p-2 font-semibold tabular-nums text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {Number(item.quantity).toLocaleString()} {item.units}
                      </td>
                      <td className="p-2">
                        <ConditionBadge condition={item.status} />
                      </td>
                      <td className="p-2 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                        {item.room || "Target room"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onImportDirect}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-md shadow-amber-700/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} />
              <span>
                Add Directly to Inventory (
                {analysis.totalItems.toLocaleString()})
              </span>
            </button>

            <button
              type="button"
              onClick={onImportCurrentRoom}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Folder size={16} />
              <span>Add All to {targetLabel}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onReplaceAll}
              className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Replace Entire Database Instead</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
