import React from 'react';
import { InventoryItem, Room } from '../types/inventory';
import { normalizeStatus } from '../utils/status';

interface Props {
  items: InventoryItem[];
  rooms: Room[];
  facilityName: string;
}

/**
 * Formal audit sheet. Hidden on screen, revealed by the `@media print` rules in
 * index.html so "Print Sheet" produces a signed, letterheaded document.
 */
export const PrintReport: React.FC<Props> = ({ items, rooms, facilityName }) => {
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const auditDate = new Date().toLocaleDateString();

  return (
    <div id="printable-report" className="print-only p-8 text-black bg-white">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="KM100 Logo" className="w-14 h-14 object-contain rounded-full" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">
              KM100 SKILLS AND TRAINING CENTER, INC.
            </h1>
            <p className="text-xs text-gray-700">
              Official Physical Asset &amp; Property Inventory System
            </p>
            <h2 className="text-sm font-bold uppercase tracking-wider text-black mt-1">
              OFFICIAL PHYSICAL INVENTORY REPORT
            </h2>
          </div>
        </div>
        <div className="text-right text-xs text-gray-700">
          <div>
            Facility: <strong className="text-black">{facilityName}</strong>
          </div>
          <div>
            Audit Date: <strong className="text-black">{auditDate}</strong>
          </div>
          <div>
            Catalog Items: <strong className="text-black">{items.length}</strong> | Total Units:{' '}
            <strong className="text-black">{totalUnits}</strong>
          </div>
        </div>
      </div>

      <table className="w-full text-left text-xs border border-black mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-black font-bold">#</th>
            <th className="p-2 border border-black font-bold">ITEM NAME</th>
            <th className="p-2 border border-black font-bold">CATEGORY</th>
            <th className="p-2 border border-black font-bold text-center">QTY</th>
            <th className="p-2 border border-black font-bold text-center">UNITS</th>
            <th className="p-2 border border-black font-bold text-center">STATUS</th>
            <th className="p-2 border border-black font-bold">FACILITY ROOM</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const room = rooms.find((candidate) => candidate.id === item.roomId);
            return (
              <tr key={item.id}>
                <td className="p-2 border border-black text-center">{index + 1}</td>
                <td className="p-2 border border-black font-semibold">{item.name}</td>
                <td className="p-2 border border-black">{item.category}</td>
                <td className="p-2 border border-black text-center font-bold">
                  {Number(item.quantity) || 0}
                </td>
                <td className="p-2 border border-black text-center">{item.units || 'pcs'}</td>
                <td className="p-2 border border-black text-center">
                  {normalizeStatus(item.status ?? item.condition)}
                </td>
                <td className="p-2 border border-black">{room ? room.name : item.room}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-8 pt-8 mt-12 border-t border-gray-400 text-xs">
        <div className="space-y-12">
          <p className="font-semibold text-gray-700">Prepared / Inventoried By:</p>
          <div className="border-b border-black w-48" />
          <p className="text-[11px] text-gray-500">Property Custodian / Instructor</p>
        </div>
        <div className="space-y-12">
          <p className="font-semibold text-gray-700">Audited / Inspected By:</p>
          <div className="border-b border-black w-48" />
          <p className="text-[11px] text-gray-500">Quality Assurance Inspector</p>
        </div>
        <div className="space-y-12">
          <p className="font-semibold text-gray-700">Approved By:</p>
          <div className="border-b border-black w-48" />
          <p className="text-[11px] text-gray-500">Center Administrator / President</p>
        </div>
      </div>
    </div>
  );
};
