import React from 'react';
import { Building, LayoutDashboard, Plus, X } from 'lucide-react';
import { Room } from '../types/inventory';

interface Props {
  rooms: Room[];
  selectedRoomId: string;
  totalItemsCount: number;
  roomItemCounts: Record<string, { unique: number; totalQty: number }>;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: () => void;
  onClose: () => void;
}

/** Slide-in facility menu for phones and small tablets. */
export const MobileNav: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  totalItemsCount,
  roomItemCounts,
  onSelectRoom,
  onAddRoom,
  onClose
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex md:hidden no-print animate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-drawer-title"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />
      <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 border-r border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Building size={16} />
            </span>
            <h3 id="mobile-drawer-title" className="font-bold text-sm text-slate-900">
              Facility Rooms
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close facility rooms menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => {
              onSelectRoom('ALL');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRoomId === 'ALL'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={16} />
              <span>All Facilities (Master)</span>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                selectedRoomId === 'ALL'
                  ? 'bg-amber-800 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalItemsCount}
            </span>
          </button>

          {rooms.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const counts = roomItemCounts[room.id] || { unique: 0, totalQty: 0 };
            return (
              <button
                key={room.id}
                onClick={() => {
                  onSelectRoom(room.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building
                    size={15}
                    className={isSelected ? 'text-white' : 'text-amber-600'}
                  />
                  <span className="truncate">{room.name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {counts.unique}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              onAddRoom();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-700 border border-amber-200"
          >
            <Plus size={14} /> Add New Facility Room
          </button>
        </div>
      </div>
    </div>
  );
};
