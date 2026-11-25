import React, { useMemo } from "react";
import { InventoryItem, Room } from "../types/inventory";
import { normalizeStatus } from "../utils/status";
import { KM100_LOGO_BASE64 } from "../data/logoBase64";

// ── 1. Type Definitions & Interfaces ─────────────────────────────────────────

interface Props {
  /** Array of inventory items to render in the audit report */
  items: InventoryItem[];
  /** Array of available rooms used to resolve location names */
  rooms: Room[];
  /** Current facility scope name (e.g. specific room or "All Facilities") */
  facilityName: string;
  facilityId?: string;
}

// ── 2. Static Constants & Pure Data Transformers (Module Scope) ──────────────

/**
 * Standard brand name mappings enforced by KM100 property custody governance.
 */
const BRAND_RENAMES: Readonly<Record<string, string>> = {
  "Analog Multimeter Sanwa": "Sanwa Analog Multimeter",
  "191ml WD-40": "WD-40 191ml",
  "Switch Catalyst 2960G": "Catalyst 2960G Switch",
  "Switch Catalyst 3560G": "Catalyst 3560G Switch",
};

/**
 * Pure data transformation function that sanitizes, merges duplicate items,
 * and normalizes categories according to official audit standards.
 */
export function normalizeReportInventory(
  rawItems: readonly InventoryItem[],
): InventoryItem[] {
  const merged: InventoryItem[] = [];

  for (const item of rawItems) {
    const currentItem: InventoryItem = { ...item };

    // Standardize CSS Books category to "Books and References"
    if (
      currentItem.name === "CSS Books" &&
      (currentItem.category === "Peripherals and Storage" ||
        !currentItem.category)
    ) {
      currentItem.category = "Books and References";
    }

    // Standardize known vendor brand prefixes
    if (BRAND_RENAMES[currentItem.name]) {
      currentItem.name = BRAND_RENAMES[currentItem.name];
    }

    // Deduplicate Crimping Tools Non-Pass through sharing room, status, and unit
    if (currentItem.name === "Crimping Tools Non-Pass through") {
      const existingIdx = merged.findIndex(
        (m) =>
          m.name === currentItem.name &&
          m.roomId === currentItem.roomId &&
          m.status === currentItem.status &&
          m.units === currentItem.units,
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
}

// ── 3. Component Implementation ──────────────────────────────────────────────

/**
 * Formal audit sheet. Hidden on screen, revealed by the `@media print` rules in
 * index.html so "Print Sheet" produces an official, signed, letterheaded document.
 * Follows industry-standard co-located Tailwind utility classes directly in JSX.
 */
export const PrintReport: React.FC<Props> = ({
  items,
  rooms,
  facilityName,
  facilityId,
}) => {
  // Clean, normalized items for the audit table
  const reportItems = useMemo(() => normalizeReportInventory(items), [items]);

  // O(1) room map lookup instead of O(N * M) nested find in render loop
  const roomNameMap = useMemo(
    () => new Map(rooms.map((r) => [r.id, r.name])),
    [rooms],
  );

  const totalUnits = useMemo(
    () =>
      reportItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [reportItems],
  );

  const totalItems = reportItems.length;

  const auditDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const docRef = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `KM100-AIR-${y}-${m}${d}-${rand}`;
  }, [facilityId, facilityName, reportItems.length]);

  const institutionName = useMemo(() => {
    if (facilityId === "PETC" || facilityId === "fac-petc")
      return "KM100 PRIVATE EMISSION TESTING CENTER (PETC)";
    if (facilityId === "KNOAH_MARI" || facilityId === "fac-knoah-mari")
      return "KNOAH MARI CAFÉ & EVENTS";
    if (facilityId === "RED_GOOSE" || facilityId === "fac-red-goose")
      return "RED GOOSE RESTO & CAFÉ";
    if (facilityId === "STC" || facilityId === "fac-km100-stc")
      return "KM100 SKILLS AND TRAINING CENTER, INC.";
    if (facilityName && facilityName !== "All Facilities") {
      return `${facilityName.toUpperCase()} — PROPERTY CUSTODY`;
    }
    return "KM100 ENTERPRISE — MULTI-FACILITY PROPERTY CUSTODY";
  }, [facilityId, facilityName]);

  const scopeDisplay =
    !facilityName ||
    facilityName === "Master Inventory (All Facilities)" ||
    facilityName === "All Facilities"
      ? "All Facilities"
      : facilityName;

  return (
    <div id="printable-report" className="print-only bg-white p-7 text-black">
      {/* ── Document Header & Institutional Brand ───────────────────── */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center gap-4">
          <img
            src={KM100_LOGO_BASE64}
            alt="KM100 Logo"
            width={56}
            height={56}
            className="w-14 h-14 object-contain rounded-full shrink-0"
            style={{
              width: "56px",
              height: "56px",
              objectFit: "contain",
              borderRadius: "9999px",
            }}
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black">
              {institutionName}
            </h1>
            <p className="text-xs text-gray-700">
              Official Physical Asset &amp; Property Inventory System
            </p>
            <h2 className="text-sm font-bold uppercase tracking-wider text-black mt-1">
              OFFICIAL PHYSICAL INVENTORY REPORT
            </h2>
          </div>
        </div>
        <div className="text-right text-xs text-gray-700 space-y-0.5">
          <div>
            Facility: <strong className="text-black">{scopeDisplay}</strong>
          </div>
          <div>
            Audit Date: <strong className="text-black">{auditDate}</strong>
          </div>
          <div>
            Doc. Ref.: <strong className="text-black">{docRef}</strong>
          </div>
          <div>
            Catalog Items:{" "}
            <strong className="text-black">
              {totalItems.toLocaleString()}
            </strong>{" "}
            &middot; Total Units:{" "}
            <strong className="text-black">
              {totalUnits.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* ── Official Inventory Audit Table ──────────────────────────── */}
      <table className="mb-6 w-full table-fixed border-collapse border border-black bg-white text-left text-[9px]">
        <thead>
          <tr className="bg-white font-bold text-black">
            <th
              scope="col"
              className="w-8 border border-black bg-white p-1.5 text-center font-bold text-black"
            >
              #
            </th>
            <th
              scope="col"
              className="w-[29%] border border-black bg-white px-2 py-1.5 font-bold text-black"
            >
              Item
            </th>
            <th
              scope="col"
              className="w-[21%] border border-black bg-white px-2 py-1.5 font-bold text-black"
            >
              Category
            </th>
            <th
              scope="col"
              className="w-11 border border-black bg-white p-1.5 text-center font-bold text-black"
            >
              Qty
            </th>
            <th
              scope="col"
              className="w-12 border border-black bg-white p-1.5 text-center font-bold text-black"
            >
              Unit
            </th>
            <th
              scope="col"
              className="w-16 border border-black bg-white p-1.5 text-center font-bold text-black"
            >
              Status
            </th>
            <th
              scope="col"
              className="w-36 border border-black bg-white px-2 py-1.5 font-bold text-black"
            >
              Location
            </th>
          </tr>
        </thead>
        <tbody>
          {reportItems.map((item, index) => {
            const location =
              roomNameMap.get(item.roomId ?? "") ?? item.room ?? "Unassigned";
            return (
              <tr key={item.id} className="break-inside-avoid bg-white">
                <td className="border border-black p-1.5 text-center tabular-nums text-black">
                  {index + 1}
                </td>
                <td className="border border-black px-2 py-1.5 font-semibold text-black break-words">
                  {item.name}
                </td>
                <td className="border border-black px-2 py-1.5 text-black break-words">
                  {item.category}
                </td>
                <td className="border border-black p-1.5 text-center font-bold tabular-nums text-black">
                  {Number(item.quantity) || 0}
                </td>
                <td className="border border-black p-1.5 text-center text-black">
                  {item.units || "pcs"}
                </td>
                <td className="border border-black p-1.5 text-center text-[8px] font-semibold uppercase text-black">
                  {normalizeStatus(item.status ?? item.condition)}
                </td>
                <td className="border border-black px-2 py-1.5 text-black break-words">
                  {location}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="break-inside-avoid border border-black bg-white font-bold">
            <td
              scope="row"
              className="border border-black px-2 py-1.5 text-center font-bold text-black"
              colSpan={3}
            >
              TOTALS
            </td>
            <td className="border border-black p-1.5 text-center font-bold tabular-nums text-black">
              {totalUnits.toLocaleString()}
            </td>
            <td className="border border-black p-1.5 text-center font-bold tabular-nums text-black">
              {totalItems.toLocaleString()} items
            </td>
            <td
              className="border border-black p-1.5 text-center"
              colSpan={2}
            ></td>
          </tr>
        </tfoot>
      </table>

      {/* ── Official Three-Party Sign-Off Block ─────────────────────── */}
      <section className="grid grid-cols-3 gap-6 pt-2 text-center text-[9px] break-inside-avoid">
        <div>
          <p className="mb-7 font-bold text-black">Prepared By:</p>
          <div className="mb-1 w-full border-b border-black" />
          <p className="font-semibold text-black">Property Custodian</p>
          <p className="mt-0.5 text-gray-600">Signature over Printed Name</p>
        </div>

        <div>
          <p className="mb-7 font-bold text-black">Audited / Inspected By:</p>
          <div className="mb-1 w-full border-b border-black" />
          <p className="font-semibold text-black">
            Quality Assurance Inspector
          </p>
          <p className="mt-0.5 text-gray-600">Signature over Printed Name</p>
        </div>

        <div>
          <p className="mb-7 font-bold text-black">Approved By:</p>
          <div className="mb-1 w-full border-b border-black" />
          <p className="font-semibold text-black">President</p>
          <p className="mt-0.5 text-gray-600">Signature over Printed Name</p>
        </div>
      </section>

      {/* ── Legal & Compliance Footer ───────────────────────────────── */}
      <footer className="mt-5 text-center text-[8px] text-gray-600 break-inside-avoid">
        <p>
          This document is an official record of KM100 Skills and Training
          Center, Inc &mdash; unauthorized reproduction or alteration is
          prohibited
        </p>
        <p>
          Generated from KM100 Inventory Management System &mdash; {auditDate}
        </p>
      </footer>
    </div>
  );
};
