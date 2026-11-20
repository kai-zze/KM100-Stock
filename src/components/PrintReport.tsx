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
  const totalItems = items.length;
  const auditDate = new Date().toLocaleDateString();
  const docRef = `KM100-AIR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;

  return (
    <div id="printable-report" className="print-only p-8 text-black bg-white">
      <div className="border-b-4 border-black pb-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="KM100 Logo" className="w-16 h-16 object-contain rounded-full" />
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold leading-tight">
                KM100 SKILLS AND TRAINING CENTER, INC.
              </p>
              <p className="text-[9px] text-gray-500 leading-tight">
                Official Physical Asset &amp; Property Inventory System<br />
                Skills and Training Center, Inc. • Inventory Control Department<br />
                Document Control: Audit &amp; Compliance Division
              </p>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black mt-2">
                OFFICIAL PHYSICAL INVENTORY REPORT
              </h2>
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-700 space-y-1">
            <p className="font-bold text-black">Facility:</p>
            <p className="font-bold text-black">{facilityName}</p>
            <p className="font-bold text-black">Audit Date:</p>
            <p className="font-bold text-black">{auditDate}</p>
            <p className="font-bold text-black">Doc. Ref.:</p>
            <p className="font-mono text-black">{docRef}</p>
            <p className="font-bold text-black">Catalog Items:</p>
            <p className="font-bold text-black">{totalItems}</p>
            <p className="font-bold text-black">Total Units:</p>
            <p className="font-bold text-black">{totalUnits}</p>
          </div>
        </div>
      </div>

      <table className="w-full text-left text-[9px] border-collapse border border-black mb-8">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-2 border border-black font-bold text-center w-4">#</th>
            <th className="p-2 border border-black font-bold">ITEM NAME</th>
            <th className="p-2 border border-black font-bold">CATEGORY</th>
            <th className="p-2 border border-black font-bold text-center w-12">QTY</th>
            <th className="p-2 border border-black font-bold text-center w-16">UNITS</th>
            <th className="p-2 border border-black font-bold text-center w-20">STATUS</th>
            <th className="p-2 border border-black font-bold w-24">FACILITY ROOM</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const room = rooms.find((candidate) => candidate.id === item.roomId);
            const isEven = index % 2 === 1;
            return (
              <tr key={item.id} className={isEven ? 'bg-gray-50' : ''}>
                <td className="p-2 border border-black text-center">{index + 1}</td>
                <td className="p-2 border border-black font-semibold">{item.name}</td>
                <td className="p-2 border border-black">{item.category}</td>
                <td className="p-2 border border-black text-center font-bold">
                  {Number(item.quantity) || 0}
                </td>
                <td className="p-2 border border-black text-center">{item.units || 'pcs'}</td>
                <td className="p-2 border border-black text-center uppercase font-semibold text-[8px]">
                  {normalizeStatus(item.status ?? item.condition)}
                </td>
                <td className="p-2 border border-black">{room ? room.name : item.room}</td>
              </tr>
            );
          })}
          <tr className="bg-gray-200 font-bold border-2 border-black">
            <td className="p-2 border border-black text-center" colSpan="3">
              TOTALS
            </td>
            <td className="p-2 border border-black text-center">{totalUnits}</td>
            <td className="p-2 border border-black text-center">{items.reduce((s, i) => s + 1, 0)}</td>
            <td className="p-2 border border-black text-center"></td>
            <td className="p-2 border border-black"></td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-8 pt-8 mt-12 border-t-2 border-black text-[10px]">
        <div className="space-y-6">
          <p className="font-semibold text-black">Prepared / Inventoried By:</p>
          <div className="border-b border-black w-48 h-1" />
          <p className="text-gray-600">Property Custodian / Instructor</p>
          <p className="text-gray-600">Date: ________________</p>
        </div>
        <div className="space-y-6">
          <p className="font-semibold text-black">Audited / Inspected By:</p>
          <div className="border-b border-black w-48 h-1" />
          <p className="text-gray-600">Quality Assurance Inspector</p>
          <p className="text-gray-600">Date: ________________</p>
        </div>
        <div className="space-y-6">
          <p className="font-semibold text-black">Approved By:</p>
          <div className="border-b border-black w-48 h-1" />
          <p className="text-gray-600">Center Administrator / President</p>
          <p className="text-gray-600">Date: ________________</p>
        </div>
      </div>

      <div className="mt-8 border-t border-black pt-4 text-[8px] text-gray-600 text-center">
        <p>This document is an official record of KM100 Skills and Training Center, Inc. Unauthorized reproduction or alteration is prohibited.</p>
        <p>Generated from KM100 Inventory Management System • {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};
