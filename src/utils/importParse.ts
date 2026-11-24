import * as XLSX from "xlsx";
import { InventoryItem, ItemStatus } from "../types/inventory";
import { generateItemId } from "./ids";
import { normalizeStatus } from "./status";
import { parseCsvText } from "./csvImport";

export interface ParsedImportItem extends InventoryItem {
  /** Facility name discovered in the sheet. Resolved to a room id on import. */
  room: string;
}

export interface SheetBreakdown {
  sheetName: string;
  count: number;
}

export interface ImportAnalysis {
  fileName: string;
  fileSize: string;
  totalItems: number;
  items: ParsedImportItem[];
  roomsList: string[];
  roomCounts: Record<string, number>;
  sheetBreakdown: SheetBreakdown[];
  samplePreview: ParsedImportItem[];
}

type CanonicalField =
  "name" | "category" | "quantity" | "units" | "status" | "remarks" | "room";

const FIELD_ALIASES: Record<string, CanonicalField> = {
  itemname: "name",
  name: "name",
  item: "name",
  itemdescription: "name",
  description: "name",
  article: "name",
  equipment: "name",
  asset: "name",

  category: "category",
  type: "category",
  classification: "category",
  group: "category",

  quantity: "quantity",
  qty: "quantity",
  count: "quantity",
  stock: "quantity",
  onhand: "quantity",
  pieces: "quantity",

  units: "units",
  unit: "units",
  uom: "units",
  measure: "units",

  status: "status",
  condition: "status",
  state: "status",
  conditionstatus: "status",
  statuscondition: "status",

  remarks: "remarks",
  remark: "remarks",
  notes: "remarks",
  note: "remarks",
  comment: "remarks",
  comments: "remarks",

  room: "room",
  roomname: "room",
  roomlocation: "room",
  location: "room",
  facility: "room",
  facilityroom: "room",
  area: "room",
  assignedroom: "room",
  roomfacility: "room",
};

const normalizeKey = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const HEADER_SCAN_ROWS = 25;

/** Sheet names that are report scaffolding rather than a facility name. */
function isGenericSheetName(name: string): boolean {
  const s = name.toLowerCase();
  return (
    /^sheet\s*\d*$/.test(s) ||
    s.includes("master") ||
    s.includes("inventory") ||
    s.includes("summary") ||
    s.includes("template") ||
    s.includes("report") ||
    s.includes("catalog")
  );
}

interface HeaderMap {
  rowIndex: number;
  columns: Partial<Record<CanonicalField, number>>;
  score: number;
}

function findHeaderRow(matrix: unknown[][]): HeaderMap | null {
  let best: HeaderMap | null = null;

  const limit = Math.min(matrix.length, HEADER_SCAN_ROWS);
  for (let r = 0; r < limit; r++) {
    const row = matrix[r] || [];
    const columns: Partial<Record<CanonicalField, number>> = {};
    let matches = 0;

    row.forEach((cell, index) => {
      const field = FIELD_ALIASES[normalizeKey(cell)];
      if (field && columns[field] === undefined) {
        columns[field] = index;
        matches += 1;
      }
    });

    if (columns.name === undefined) continue;

    const score = matches + 2;
    if (!best || score > best.score) {
      best = { rowIndex: r, columns, score };
    }
  }

  return best;
}

function parseQuantity(raw: unknown): number {
  const cleaned = String(raw ?? "")
    .replace(/[^0-9.-]/g, "")
    .trim();
  if (!cleaned) return 1;
  const parsed = parseFloat(cleaned);
  if (Number.isNaN(parsed)) return 1;
  return Math.max(0, parsed);
}

function cellAt(row: unknown[], index: number | undefined): string {
  if (index === undefined) return "";
  const value = row[index];
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function buildItemsFromMatrix(
  matrix: unknown[][],
  sheetName: string,
): ParsedImportItem[] {
  const header = findHeaderRow(matrix);
  if (!header) return [];

  const headerLabels = new Set(
    (matrix[header.rowIndex] || [])
      .map((cell) => normalizeKey(cell))
      .filter(Boolean),
  );

  const items: ParsedImportItem[] = [];
  const fallbackRoom = isGenericSheetName(sheetName) ? "" : sheetName.trim();

  for (let r = header.rowIndex + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const name = cellAt(row, header.columns.name);

    // Skip blank rows and repeated header rows mid-sheet.
    if (!name || headerLabels.has(normalizeKey(name))) continue;

    const status = normalizeStatus(
      cellAt(row, header.columns.status) || "Working",
    ) as ItemStatus;

    const room = cellAt(row, header.columns.room) || fallbackRoom;
    const now = new Date().toISOString();

    items.push({
      id: generateItemId(),
      roomId: "",
      name,
      category: cellAt(row, header.columns.category) || "General",
      quantity: parseQuantity(cellAt(row, header.columns.quantity)),
      units: cellAt(row, header.columns.units) || "pcs",
      status,
      condition: status,
      remarks: cellAt(row, header.columns.remarks),
      room,
      createdAt: now,
      updatedAt: now,
    });
  }

  return items;
}

function csvObjectsToMatrix(rows: Record<string, string>[]): unknown[][] {
  if (rows.length === 0) return [];
  const header = Object.keys(rows[0]);
  return [header, ...rows.map((row) => header.map((key) => row[key]))];
}

function summarize(
  fileName: string,
  fileSize: string,
  items: ParsedImportItem[],
  sheetBreakdown: SheetBreakdown[],
): ImportAnalysis {
  const roomCounts: Record<string, number> = {};
  items.forEach((item) => {
    const key = item.room || "Unassigned";
    roomCounts[key] = (roomCounts[key] || 0) + 1;
  });

  return {
    fileName,
    fileSize,
    totalItems: items.length,
    items,
    roomsList: Object.keys(roomCounts).filter((name) => name !== "Unassigned"),
    roomCounts,
    sheetBreakdown,
    samplePreview: items.slice(0, 5),
  };
}

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

/**
 * Parse any supported spreadsheet into a previewable import analysis.
 * Handles title banners, multiple sheets, room discovery, and legacy statuses.
 */
export async function analyzeSpreadsheet(file: File): Promise<ImportAnalysis> {
  const fileSize = `${(file.size / 1024).toFixed(1)} KB`;
  const isCsv = file.name.toLowerCase().endsWith(".csv");

  const items: ParsedImportItem[] = [];
  const sheetBreakdown: SheetBreakdown[] = [];

  if (isCsv) {
    const text = await readAsText(file);
    const parsed = buildItemsFromMatrix(
      csvObjectsToMatrix(parseCsvText(text)),
      file.name,
    );
    items.push(...parsed);
    if (parsed.length > 0)
      sheetBreakdown.push({ sheetName: file.name, count: parsed.length });
  } else {
    const buffer = await readAsArrayBuffer(file);
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return;
      const matrix = (XLSX.utils.sheet_to_json as any)(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      }) as unknown[][];
      const parsed = buildItemsFromMatrix(matrix, sheetName);
      if (parsed.length > 0) {
        items.push(...parsed);
        sheetBreakdown.push({ sheetName, count: parsed.length });
      }
    });
  }

  return summarize(file.name, fileSize, items, sheetBreakdown);
}
