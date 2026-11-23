import React from 'react';
import { Tag, X, Printer } from 'lucide-react';
import { InventoryItem, Room } from '../types/inventory';
import { normalizeStatus } from '../utils/status';

interface Props {
  item: InventoryItem;
  rooms: Room[];
  onClose: () => void;
}

export const AssetTagModal: React.FC<Props> = ({ item, rooms, onClose }) => {
  const roomName =
    item.room || rooms.find((room) => room.id === item.roomId)?.name || 'KM100 Lab';

  const handlePrint = () => {
    // The global print stylesheet hides dialogs, so opt this one back in.
    document.body.classList.add('print-asset-tag');
    window.print();
    window.setTimeout(() => document.body.classList.remove('print-asset-tag'), 800);
  };

  return (
    <div
      className="asset-tag-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-tag-title"
    >
      <div className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="asset-tag-controls flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <Tag size={18} />
            </div>
            <h3 id="asset-tag-title" className="text-sm font-heading font-bold text-slate-900 dark:text-white">
              Asset tag
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close asset tag dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Physical sticker */}
        <div className="asset-tag-sticker border-2 border-dashed border-slate-300 p-4 rounded-2xl bg-white text-black space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-black">
            <img src="/assets/logo.png" alt="KM100 Logo" className="w-8 h-8 object-contain" />
            <div>
              <h4 className="text-[11px] font-black uppercase text-black leading-tight">
                KM100 Skills &amp; Training Center
              </h4>
              <p className="text-[9px] text-gray-700">Property asset tag</p>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div>
              Property ID: <strong className="font-mono text-xs">{item.id}</strong>
            </div>
            <div>
              Item: <strong>{item.name}</strong>
            </div>
            <div>
              Category: <span className="text-gray-800">{item.category}</span>
            </div>
            <div>
              Location: <strong>{roomName}</strong>
            </div>
            <div>
              Status: <strong>{normalizeStatus(item.status ?? item.condition)}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-300 flex items-center justify-between text-[9px] font-mono text-gray-600">
            <div className="flex gap-0.5 h-6 items-end" aria-hidden="true">
              <div className="w-1 h-6 bg-black" />
              <div className="w-0.5 h-6 bg-black" />
              <div className="w-1.5 h-6 bg-black" />
              <div className="w-0.5 h-6 bg-black" />
              <div className="w-2 h-6 bg-black" />
              <div className="w-1 h-6 bg-black" />
              <div className="w-0.5 h-6 bg-black" />
              <div className="w-1.5 h-6 bg-black" />
            </div>
            <span>SCAN FOR AUDIT</span>
          </div>
        </div>

        <div className="asset-tag-controls flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white"
          >
            <Printer size={14} /> Print sticker
          </button>
        </div>
      </div>
    </div>
  );
};
