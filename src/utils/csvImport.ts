import { normalizeStatus } from "./status";

// CSV import utilities for KM100 Inventory System
// Pure, testable logic for parsing CSV text into row objects.

export interface CsvRow {
  [key: string]: string;
}

/**
 * Parses CSV text into a 2D matrix of trimmed cell strings.
 * Strips UTF-8 BOM, handles quoted commas/newlines/escaped quotes, and avoids
 * treating mid-field inch marks (e.g. `3.5" HDD`) as quote delimiters.
 */
export function parseCsvMatrix(rawText: string): string[][] {
  const text = (rawText || "").replace(/^\uFEFF/, "");
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++; // escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && field.trim().length === 0) {
      field = "";
      inQuotes = true;
    } else if (ch === ",") {
      record.push(field.trim());
      field = "";
    } else if (ch === "\n") {
      record.push(field.trim());
      records.push(record);
      record = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field.trim());
    records.push(record);
  }

  return records.filter((r) => r.some((cell) => cell.length > 0));
}

/**
 * Minimal CSV parser. Handles quoted fields containing commas, quotes and
 * newlines. Returns an array of objects keyed by the header row.
 */
export function parseCsvText(text: string): CsvRow[] {
  const rows = parseCsvMatrix(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj: CsvRow = {};
    header.forEach((h, idx) => {
      if (h && obj[h] === undefined) {
        obj[h] = (cells[idx] ?? "").trim();
      }
    });
    return obj;
  });
}

function parseCsvQuantity(raw: unknown): number {
  if (raw === undefined || raw === null) return 1;
  const str = String(raw).trim();
  if (!str) return 1;
  const num = Number(str.replace(/,/g, ""));
  if (!Number.isFinite(num)) return 1;
  return Math.max(0, num);
}

/**
 * Map parsed CSV rows into InventoryItem-shaped objects ready for insertion.
 * `defaultRoomId` is used when the row does not specify a room.
 */
export function parseImportRows(
  rows: CsvRow[],
  defaultRoomId: string,
): Array<{
  id: string;
  roomId: string;
  name: string;
  category: string;
  quantity: number;
  units: string;
  status: string;
  condition: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}> {
  return rows.map((row, index) => {
    const normalized = normalizeStatus(
      row.status || row.Status || row.condition || row.Condition || "Working",
    );
    const rawQty = row.quantity ?? row.QUANTITY ?? row.qty;
    return {
      id: `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      roomId: row.roomId || row.room || defaultRoomId,
      name: String(
        row.name ||
          row["ITEM NAME"] ||
          row["Item Name"] ||
          `Imported Item ${index + 1}`,
      ),
      category: String(row.category || row.CATEGORY || "General"),
      quantity: parseCsvQuantity(rawQty),
      units: String(row.units || row.UNITS || "pcs"),
      status: normalized,
      condition: normalized,
      remarks: String(row.remarks || row.Remarks || ""),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}
