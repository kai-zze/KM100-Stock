import { ColumnDefinition, InventoryItem, Room } from "../types/inventory";
import { normalizeStatus } from "./status";

interface ExportColumn {
  id: string;
  label: string;
}

/**
 * Resolve the export schema: the caller's visible columns, plus a room column
 * if the schema does not already have one. `status`/`condition` collapse into
 * one column because they hold the same value.
 */
export function resolveCsvColumns(columns: ColumnDefinition[]): ExportColumn[] {
  const resolved: ExportColumn[] = [];
  let hasRoom = false;
  let hasStatus = false;

  columns.forEach((col) => {
    if (col.id === "room" || col.id === "roomId" || col.id === "roomLocation") {
      hasRoom = true;
      resolved.push({ id: "_room", label: col.label || "ROOM" });
    } else if (col.id === "status" || col.id === "condition") {
      if (hasStatus) return;
      hasStatus = true;
      resolved.push({ id: "_status", label: col.label || "Status" });
    } else {
      resolved.push({ id: col.id, label: col.label || col.id });
    }
  });

  if (!hasRoom) resolved.push({ id: "_room", label: "ROOM" });
  return resolved;
}

function cellValue(
  column: ExportColumn,
  item: InventoryItem,
  roomName: string,
): string {
  if (column.id === "_room") return roomName;
  if (column.id === "_status")
    return normalizeStatus(item.status ?? item.condition);
  if (column.id === "quantity") return String(Number(item.quantity) || 0);
  if (column.id === "units") return item.units || "pcs";
  const value = item[column.id];
  return value === undefined || value === null ? "" : String(value);
}

const escapeCsv = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export function buildInventoryCsv(
  items: InventoryItem[],
  rooms: Room[],
  columns: ColumnDefinition[],
): string {
  const exportColumns = resolveCsvColumns(columns);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));

  const lines = [exportColumns.map((col) => escapeCsv(col.label)).join(",")];

  items.forEach((item) => {
    const roomName = item.room || roomNames.get(item.roomId) || "Unassigned";
    const row = exportColumns.map((col) =>
      escapeCsv(cellValue(col, item, roomName)),
    );
    lines.push(row.join(","));
  });

  // UTF-8 BOM keeps Excel from mangling en dashes and the peso sign.
  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadInventoryCsv(
  items: InventoryItem[],
  rooms: Room[],
  columns: ColumnDefinition[],
): void {
  const csv = buildInventoryCsv(items, rooms, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "KM100_Skills_and_Training_Center,_Inc._INVENTORY.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
