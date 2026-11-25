import * as XLSX from "xlsx";
import { ColumnDefinition, InventoryItem, Room } from "../types/inventory";
import { normalizeStatus } from "./status";
import { makeUniqueSheetName, sanitizeFormulaCell } from "./spreadsheetSafety";

export function exportInventoryToExcel(
  mode: "multi" | "current",
  rooms: Room[],
  items: InventoryItem[],
  columns: ColumnDefinition[],
  selectedRoom?: Room,
) {
  const wb = XLSX.utils.book_new();

  // Dynamically resolve columns consistent with system schema
  const activeCols =
    columns && columns.length > 0
      ? columns
      : ([
          { id: "name", label: "ITEM NAME", type: "text", order: 1 },
          { id: "category", label: "CATEGORY", type: "dropdown", order: 2 },
          { id: "quantity", label: "QUANTITY", type: "number", order: 3 },
          { id: "units", label: "UNITS", type: "dropdown", order: 4 },
          { id: "status", label: "Status", type: "dropdown", order: 5 },
        ] as ColumnDefinition[]);

  // Ensure Room column is represented
  const exportCols: {
    id: string;
    label: string;
    width: number;
    isNumber?: boolean;
    isStatus?: boolean;
  }[] = [];
  let hasRoomCol = false;
  let hasStatusCol = false;

  activeCols.forEach((col) => {
    if (col.id === "room" || col.id === "roomId" || col.id === "roomLocation") {
      if (hasRoomCol) return;
      hasRoomCol = true;
      exportCols.push({ id: "_room", label: col.label || "ROOM", width: 32 });
    } else if (col.id === "name") {
      exportCols.push({
        id: "name",
        label: col.label || "ITEM NAME",
        width: 55,
      });
    } else if (col.id === "category") {
      exportCols.push({
        id: "category",
        label: col.label || "CATEGORY",
        width: 35,
      });
    } else if (col.id === "quantity") {
      exportCols.push({
        id: "quantity",
        label: col.label || "QUANTITY",
        width: 22,
        isNumber: true,
      });
    } else if (col.id === "units") {
      exportCols.push({ id: "units", label: col.label || "UNITS", width: 20 });
    } else if (col.id === "status" || col.id === "condition") {
      if (hasStatusCol) return;
      hasStatusCol = true;
      exportCols.push({
        id: "status",
        label: col.label || "Status",
        width: 22,
        isStatus: true,
      });
    } else {
      exportCols.push({
        id: col.id,
        label: col.label,
        width: Math.max(22, (col.label || "").length * 1.5 + 4),
        isNumber: col.type === "number",
      });
    }
  });

  if (!hasRoomCol) {
    exportCols.push({ id: "_room", label: "ROOM", width: 32 });
  }

  const numCols = exportCols.length;
  const getColLetter = (colIdx1Based: number) => {
    let letter = "";
    let temp = colIdx1Based;
    while (temp > 0) {
      const mod = (temp - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      temp = Math.floor((temp - mod) / 26);
    }
    return letter;
  };
  const lastColLetter = getColLetter(numCols);

  const buildRoomRows = (
    roomItems: InventoryItem[],
    defaultRoomName: string,
  ) => {
    const rows: (string | number)[][] = [
      exportCols.map((c) => sanitizeFormulaCell(c.label)),
    ];

    let totalQty = 0;
    roomItems.forEach((item) => {
      const roomObj = rooms.find((r) => r.id === item.roomId);
      const roomName = roomObj?.name || item.room || defaultRoomName;
      const q = Number(item.quantity) || 0;
      totalQty += q;

      const rowValues = exportCols.map((col) => {
        if (col.id === "_room") return sanitizeFormulaCell(roomName);
        if (col.id === "quantity") return q;
        if (col.id === "status")
          return normalizeStatus(item.status || item.condition);
        if (col.id === "units") return sanitizeFormulaCell(item.units || "pcs");
        const raw = item[col.id];
        if (raw === undefined || raw === null) return "";
        if (typeof raw === "number") return raw;
        return sanitizeFormulaCell(String(raw));
      });
      rows.push(rowValues);
    });

    // Summary Total Row
    if (roomItems.length > 0) {
      const summaryRow: (string | number)[] = new Array(numCols).fill("");
      summaryRow[0] = "TOTAL INVENTORY SUMMARY";
      if (numCols > 1) {
        summaryRow[1] = `${roomItems.length} catalog items`;
      }
      const qtyIdx = exportCols.findIndex((c) => c.id === "quantity");
      if (qtyIdx !== -1) {
        summaryRow[qtyIdx] = totalQty;
      }
      const unitsIdx = exportCols.findIndex((c) => c.id === "units");
      if (unitsIdx !== -1) {
        summaryRow[unitsIdx] = "units total";
      }
      rows.push(summaryRow);
    }

    return rows;
  };

  const createStyledSheet = (
    rows: (string | number)[][],
    roomItems: InventoryItem[],
  ) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Compute dynamic auto-fit column widths
    ws["!cols"] = exportCols.map((c) => {
      let maxLen = (c.label || "").length;
      roomItems.forEach((item) => {
        let val = "";
        if (c.id === "_room") {
          const roomObj = rooms.find((r) => r.id === item.roomId);
          val = roomObj?.name || item.room || "";
        } else if (c.id === "status") {
          val = normalizeStatus(item.status || item.condition);
        } else {
          val = item[c.id] !== undefined ? String(item[c.id]) : "";
        }
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.max(c.width || 20, Math.min(65, maxLen + 6)) };
    });

    if (rows.length > 1) {
      ws["!autofilter"] = { ref: `A1:${lastColLetter}${rows.length - 1}` };
    }
    return ws;
  };

  const usedSheetNames = new Set<string>();

  if (mode === "multi") {
    // 1. Master Sheet matching system template
    const masterRows = buildRoomRows(items, "All Rooms");
    const wsMaster = createStyledSheet(masterRows, items);
    const masterName = makeUniqueSheetName(
      "KM100 Inventory",
      "Master",
      usedSheetNames,
    );
    XLSX.utils.book_append_sheet(wb, wsMaster, masterName);

    // 2. Individual Room Sheets
    rooms.forEach((room) => {
      const roomItems = items.filter((it) => it.roomId === room.id);
      const rows = buildRoomRows(roomItems, room.name);
      const ws = createStyledSheet(rows, roomItems);
      const safeName = makeUniqueSheetName(room.name, "Room", usedSheetNames);
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });
  } else {
    const roomName = selectedRoom ? selectedRoom.name : "KM100 Inventory";
    const roomItems = selectedRoom
      ? items.filter((it) => it.roomId === selectedRoom.id)
      : items;
    const rows = buildRoomRows(roomItems, roomName);
    const ws = createStyledSheet(rows, roomItems);
    const safeName = makeUniqueSheetName(
      roomName,
      "KM100 Inventory",
      usedSheetNames,
    );
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }

  XLSX.writeFile(wb, "KM100_Skills_and_Training_Center,_Inc._INVENTORY.xlsx");
}
