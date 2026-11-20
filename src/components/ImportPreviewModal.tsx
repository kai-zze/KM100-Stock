import React from 'react';
import { FileSpreadsheet, X, Plus, Folder, Trash2 } from 'lucide-react';
import { Room } from '../types/inventory';
import type { ImportAnalysis } from '../utils/importParse';
import { ConditionBadge } from './ConditionBadge';

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
  onReplaceAll
}) => {
  const roomChipCount = analysis.roomsList.length;
  const targetLabel = currentRoom
    ? currentRoom.name.length > 18
      ? `${currentRoom.name.slice(0, 16)}...`
      : currentRoom.name
    : 'First Room';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3
                id="import-modal-title"
                className="text-base font-bold text-slate-900 flex items-center gap-2"
              >
                <span>Spreadsheet Converted</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                  {analysis.totalItems} items ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {analysis.fileName}
                {analysis.fileSize ? ` — ${analysis.fileSize}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close import preview"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Detected Facility Rooms:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {roomChipCount} facility(ies)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.roomsList.length === 0 && (
                <span className="text-[11px] text-slate-500">
                  No room column found — items will use the target room.
                </span>
              )}
              {analysis.roomsList.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-800 border border-slate-200 shadow-sm"
                >
                  <span>{name}</span>
                  <strong className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px]">
                    {analysis.roomCounts[name] || 0}
                  </strong>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Sample Converted Items:</span>
              <span className="text-[11px] text-slate-500">
                Showing top {analysis.samplePreview.length} of {analysis.totalItems}
              </span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Assigned Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysis.samplePreview.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-900 max-w-[170px] truncate">
                        {item.name}
                      </td>
                      <td className="p-2 text-slate-500">{item.category}</td>
                      <td className="p-2 font-mono font-semibold">
                        {item.quantity} {item.units}
                      </td>
                      <td className="p-2">
                        <ConditionBadge condition={item.status} />
                      </td>
                      <td className="p-2 text-slate-600 truncate max-w-[150px]">
                        {item.room || 'Target room'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-slate-200 shrink-0 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onImportDirect}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-md shadow-amber-700/25 transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Add Directly to Inventory ({analysis.totalItems})</span>
            </button>

            <button
              onClick={onImportCurrentRoom}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all active:scale-[0.98]"
            >
              <Folder size={16} />
              <span>Add All to {targetLabel}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onReplaceAll}
              className="text-[11px] font-medium text-rose-600 hover:underline flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Replace Entire Database Instead</span>
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
