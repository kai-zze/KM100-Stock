import React, { useMemo } from "react";
import { InventoryItem, Room } from "../types/inventory";
import { normalizeStatus } from "../utils/status";

interface Props {
  items: InventoryItem[];
  rooms: Room[];
  facilityName: string;
}

/**
 * Formal audit sheet. Hidden on screen, revealed by the `@media print` rules in
 * index.html so "Print Sheet" produces a signed, letterheaded document.
 */
export const PrintReport: React.FC<Props> = ({
  items,
  rooms,
  facilityName,
}) => {
  // Process items: deduplicate rows 28 & 29 (Crimping Tools Non-Pass through), update CSS Books category, and reorder brand names
  const reportItems = useMemo(() => {
    const brandRenames: Record<string, string> = {
      'Analog Multimeter Sanwa': 'Sanwa Analog Multimeter',
      '191ml WD-40': 'WD-40 191ml',
      'Switch Catalyst 2960G': 'Catalyst 2960G Switch',
      'Switch Catalyst 3560G': 'Catalyst 3560G Switch',
    };

    const merged: InventoryItem[] = [];

    for (const item of items) {
      const currentItem = { ...item };

      // Category update for CSS Books
      if (
        currentItem.name === 'CSS Books' &&
        (currentItem.category === 'Peripherals and Storage' || !currentItem.category)
      ) {
        currentItem.category = 'Books and References';
      }

      // Brand reorder
      if (brandRenames[currentItem.name]) {
        currentItem.name = brandRenames[currentItem.name];
      }

      // Duplicate merge for Crimping Tools Non-Pass through
      if (currentItem.name === 'Crimping Tools Non-Pass through') {
        const existingIdx = merged.findIndex(
          (m) =>
            m.name === currentItem.name &&
            m.roomId === currentItem.roomId &&
            m.status === currentItem.status &&
            m.units === currentItem.units
        );
        if (existingIdx !== -1) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            quantity:
              (Number(merged[existingIdx].quantity) || 0) +
              (Number(currentItem.quantity) || 0),
          };
          continue;
        }
      }

      merged.push(currentItem);
    }

    return merged;
  }, [items]);

  const totalUnits = reportItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const totalItems = reportItems.length;

  const auditDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const docRef = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `KM100-AIR-${y}-${m}${d}-${rand}`;
  }, []);

  const scopeDisplay =
    !facilityName ||
    facilityName === 'Master Inventory (All Facilities)' ||
    facilityName === 'All Facilities'
      ? 'All Facilities'
      : facilityName;

  return (
    <div id="printable-report" className="print-only p-7 text-black bg-white">
      <div className="pb-2.5 mb-4">
        <div className="flex items-stretch justify-between gap-4">
          <div className="flex items-stretch gap-3">
            <div className="flex items-center shrink-0">
              <img
                src="/assets/logo.png"
                alt="KM100 Logo"
                className="h-full max-h-[54px] w-auto aspect-square object-contain rounded-full"
              />
            </div>
            <div className="text-[9px] flex flex-col justify-center">
              <p className="text-[10px] font-semibold text-gray-800 leading-tight">
                KM100 Skills and Training Center, Inc.
              </p>
              <p className="text-[9px] font-medium text-gray-700 leading-snug mt-0.5">
                Inventory Control Department &middot; Audit &amp; Compliance
              </p>
              <div className="flex items-center gap-2 mt-1 leading-tight">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-black leading-tight">
                  PHYSICAL INVENTORY REPORT
                </h2>
                <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 border border-black rounded text-black bg-white shrink-0">
                  Official Copy
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] space-y-0.5 shrink-0 self-center">
            <div>
              <span className="text-gray-600">Scope: </span>
              <span className="font-bold text-black">{scopeDisplay}</span>
            </div>
            <div>
              <span className="text-gray-600">Audit Date: </span>
              <span className="font-bold text-black tabular-nums">{auditDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Doc Ref: </span>
              <span className="font-bold text-black tabular-nums">{docRef}</span>
            </div>
            <div>
              <span className="text-gray-600">Catalog Items: </span>
              <span className="font-bold text-black tabular-nums">{totalItems}</span>
              <span className="text-gray-400 mx-1">&middot;</span>
              <span className="text-gray-600">Total Units: </span>
              <span className="font-bold text-black tabular-nums">{totalUnits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <table className="w-full table-fixed text-left text-[9px] border-collapse border border-black mb-6 bg-white">
        <thead>
          <tr className="bg-white text-black font-bold">
            <th className="py-1.5 px-1.5 border border-black font-bold text-center w-8 text-black bg-white">
              #
            </th>
            <th className="py-1.5 px-2 border border-black font-bold w-[29%] text-black bg-white">
              Item
            </th>
            <th className="py-1.5 px-2 border border-black font-bold w-[21%] text-black bg-white">
              Category
            </th>
            <th className="py-1.5 px-1.5 border border-black font-bold text-center w-11 text-black bg-white">
              Qty
            </th>
            <th className="py-1.5 px-1.5 border border-black font-bold text-center w-12 text-black bg-white">
              Unit
            </th>
            <th className="py-1.5 px-1.5 border border-black font-bold text-center w-16 text-black bg-white">
              Status
            </th>
            <th className="py-1.5 px-2 border border-black font-bold w-36 text-black bg-white">
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {reportItems.map((item, index) => {
            const room = rooms.find(
              (candidate) => candidate.id === item.roomId,
            );
            return (
              <tr
                key={item.id}
                className="bg-white break-inside-avoid"
              >
                <td className="py-1.5 px-1.5 border border-black text-center tabular-nums text-black">
                  {index + 1}
                </td>
                <td className="py-1.5 px-2 border border-black font-semibold break-words text-black">
                  {item.name}
                </td>
                <td className="py-1.5 px-2 border border-black break-words text-black">
                  {item.category}
                </td>
                <td className="py-1.5 px-1.5 border border-black text-center font-bold tabular-nums text-black">
                  {Number(item.quantity) || 0}
                </td>
                <td className="py-1.5 px-1.5 border border-black text-center text-black">
                  {item.units || "pcs"}
                </td>
                <td className="py-1.5 px-1.5 border border-black text-center uppercase font-semibold text-[8px] text-black">
                  {normalizeStatus(item.status ?? item.condition)}
                </td>
                <td className="py-1.5 px-2 border border-black break-words text-black">
                  {room ? room.name : item.room}
                </td>
              </tr>
            );
          })}
          <tr className="bg-white font-bold border border-black break-inside-avoid">
            <td
              className="py-1.5 px-2 border border-black text-center text-black font-bold"
              colSpan={3}
            >
              TOTALS
            </td>
            <td className="py-1.5 px-1.5 border border-black text-center tabular-nums text-black font-bold">
              {totalUnits}
            </td>
            <td className="py-1.5 px-1.5 border border-black text-center tabular-nums text-black font-bold">
              {totalItems}
            </td>
            <td className="py-1.5 px-1.5 border border-black text-center" colSpan={2}></td>
          </tr>
        </tbody>
      </table>

      {/* Centered Sign-Off Block without Date */}
      <div className="grid grid-cols-3 gap-6 pt-2 text-[9px] text-center break-inside-avoid">
        <div>
          <p className="font-bold text-black mb-7">Prepared By:</p>
          <div className="border-b border-black w-full mb-1" />
          <p className="font-semibold text-black">Property Custodian</p>
          <p className="text-gray-600 mt-0.5">Signature over Printed Name</p>
        </div>

        <div>
          <p className="font-bold text-black mb-7">Audited / Inspected By:</p>
          <div className="border-b border-black w-full mb-1" />
          <p className="font-semibold text-black">
            Quality Assurance Inspector
          </p>
          <p className="text-gray-600 mt-0.5">Signature over Printed Name</p>
        </div>

        <div>
          <p className="font-bold text-black mb-7">Approved By:</p>
          <div className="border-b border-black w-full mb-1" />
          <p className="font-semibold text-black">President</p>
          <p className="text-gray-600 mt-0.5">Signature over Printed Name</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-5 text-[8px] text-gray-600 text-center break-inside-avoid">
        <p>
          This document is an official record of KM100 Skills and Training
          Center, Inc &mdash; unauthorized reproduction or alteration is
          prohibited
        </p>
        <p>
          Generated from KM100 Inventory Management System &mdash; {auditDate}
        </p>
      </div>
    </div>
  );
};
