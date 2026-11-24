import ExcelJS from "exceljs";
import { ColumnDefinition, InventoryItem, Room } from "../types/inventory";
import { normalizeStatus } from "./status";

interface ExportColumn {
  id: string;
  label: string;
  width: number;
  align: "left" | "right" | "center";
  isNumber?: boolean;
  isStatus?: boolean;
  indent?: number;
}

/* ── KM100 Brand Palette ── */
const KM_AMBER = "FFB45309";
const KM_ORANGE_HEADER = "FFF38E36";
const KM_ORANGE_BORDER = "FFF38E36";
const KM_INK = "FF0F172A";
const KM_MUTED = "FF334155";
const KM_NAVY = "FF1E293B";

const INK = KM_INK;
const NAVY = KM_NAVY;
const MUTED = KM_MUTED;
const TABLE_BORDER = KM_ORANGE_BORDER;

const ROOM_TAB_COLORS: Record<string, string> = {
  "room-ccs": KM_AMBER,
  "room-admin": "FF0D9488",
  "room-css": KM_AMBER,
  "room-bp": "FF9333EA",
};

const FALLBACK_TAB_COLORS = ["FF64748B", "FF7C3AED", "FF0891B2", KM_AMBER];

function statusPalette(raw: unknown) {
  const status = normalizeStatus(raw);
  switch (status) {
    case "Working":
      return { bg: "FFDCFCE7", font: "FF15803D", border: "FFA7F3D0" };
    case "Used":
      return { bg: "FFFEF3C7", font: "FFB45309", border: "FFFDE68A" };
    case "Defective":
      return { bg: "FFFFE4E6", font: "FFBE123C", border: "FFFECDD3" };
    case "Incomplete":
      return { bg: "FFFFEDD5", font: "FFC2410C", border: "FFFED7AA" };
    case "Empty":
      return { bg: "FFF1F5F9", font: "FF475569", border: "FFCBD5E1" };
    default:
      return { bg: "FFF8FAFC", font: "FF334155", border: "FFE2E8F0" };
  }
}

function columnLetter(index: number): string {
  let letter = "";
  let temp = index;
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

function resolveColumns(columns: ColumnDefinition[]): ExportColumn[] {
  const resolved: ExportColumn[] = [];
  let hasRoom = false;
  let hasStatus = false;

  columns.forEach((col) => {
    if (col.id === "room" || col.id === "roomId" || col.id === "roomLocation") {
      hasRoom = true;
      resolved.push({
        id: "_room",
        label: col.label || "Room / Facility",
        width: 32,
        align: "left",
      });
    } else if (col.id === "name") {
      resolved.push({
        id: "name",
        label: col.label || "Item Name",
        width: 52,
        align: "left",
        indent: 1,
      });
    } else if (col.id === "category") {
      resolved.push({
        id: "category",
        label: col.label || "Category",
        width: 32,
        align: "left",
      });
    } else if (col.id === "quantity") {
      resolved.push({
        id: "quantity",
        label: col.label || "Quantity",
        width: 20,
        align: "right",
        isNumber: true,
      });
    } else if (col.id === "units") {
      resolved.push({
        id: "units",
        label: col.label || "Units",
        width: 15,
        align: "center",
      });
    } else if (col.id === "status" || col.id === "condition") {
      if (hasStatus) return;
      hasStatus = true;
      resolved.push({
        id: "_status",
        label: col.label || "Status",
        width: 20,
        align: "center",
        isStatus: true,
      });
    } else {
      resolved.push({
        id: col.id,
        label: col.label || col.id,
        width: Math.max(20, (col.label || "").length * 1.4 + 4),
        align: col.type === "number" ? "right" : "left",
        isNumber: col.type === "number",
      });
    }
  });

  if (!hasRoom) {
    resolved.push({
      id: "_room",
      label: "Room / Facility",
      width: 32,
      align: "left",
    });
  }

  return resolved;
}

function cellText(
  column: ExportColumn,
  item: InventoryItem,
  roomName: string,
): string | number {
  if (column.id === "_room") return roomName;
  if (column.id === "_status")
    return normalizeStatus(item.status ?? item.condition);
  if (column.id === "quantity") return Number(item.quantity) || 0;
  if (column.id === "units") return item.units || "pcs";
  const value = item[column.id];
  return value === undefined || value === null
    ? ""
    : (value as string | number);
}

async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch("/logo.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ""));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface StyledExportOptions {
  mode: "multi" | "current";
  rooms: Room[];
  items: InventoryItem[];
  currentItems: InventoryItem[];
  columns: ColumnDefinition[];
  selectedRoom?: Room;
}

export async function exportInventoryToStyledExcel(
  options: StyledExportOptions,
): Promise<boolean> {
  const { mode, rooms, items, currentItems, columns, selectedRoom } = options;

  if (!ExcelJS || typeof ExcelJS.Workbook !== "function") return false;

  const exportColumns = resolveColumns(columns);
  const columnCount = exportColumns.length;
  const lastLetter = columnLetter(columnCount);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  const logo = await loadLogoBase64();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KM100 Skills and Training Center, Inc";
  workbook.lastModifiedBy = "KM100 Inventory System";
  workbook.created = new Date();

  let logoId: number | null = null;
  if (logo) {
    try {
      logoId = workbook.addImage({ base64: logo, extension: "png" });
    } catch {
      logoId = null;
    }
  }

  const populate = (
    sheet: any,
    sheetTitle: string,
    rawSheetItems: InventoryItem[],
    tabColor: string,
  ) => {
    const sheetItems = (rawSheetItems || []).filter(
      (item): item is InventoryItem => Boolean(item),
    );
    const recordCount = sheetItems.length;

    sheet.columns = exportColumns.map((col, idx) => {
      let longest = (col.label || "").length;
      sheetItems.forEach((item) => {
        const roomName = item.room || roomNames.get(item.roomId) || "";
        const text = String(cellText(col, item, roomName));
        if (text.length > longest) longest = text.length;
      });
      const baseWidth =
        col.id === "quantity" ? Math.max(col.width, 20) : col.width || 18;
      const computedWidth = Math.max(baseWidth, Math.min(64, longest + 5));
      return {
        key: col.id,
        width: idx === 0 ? Math.max(computedWidth, 24) : computedWidth,
      };
    });

    // Fully scrollable sheet
    sheet.views = [{ state: "normal", showGridLines: true }];
    if (tabColor) sheet.properties.tabColor = { argb: tabColor };

    sheet.pageSetup = {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
      printTitlesRow: "3:3",
    };

    const now = new Date();
    const monthShort = now.toLocaleString("en-US", { month: "short" });
    const today = `${monthShort} ${now.getDate()} ${now.getFullYear()}`;

    // Compact 2-row header block (32pt + 26pt = 58pt total height)
    sheet.getRow(1).height = 32;
    sheet.getRow(2).height = 26;

    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= columnCount; c++) {
        sheet.getRow(r).getCell(c).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        };
      }
    }

    const leftCol = columnCount > 1 ? "B" : "A";
    const rightSplitIdx = columnCount >= 3 ? columnCount - 1 : columnCount;
    const rightSplitLetter = columnLetter(rightSplitIdx);

    if (columnCount > 1) {
      sheet.mergeCells(`${leftCol}1:${lastLetter}1`);
    }

    if (columnCount >= 3) {
      const midEndLetter = columnLetter(rightSplitIdx - 1);
      sheet.mergeCells(`B2:${midEndLetter}2`);
      sheet.mergeCells(`${rightSplitLetter}2:${lastLetter}2`);
    }

    // Row 1: Company Name & Inventory Report Title (no period or pipe)
    const titleCell = sheet.getCell(`${leftCol}1`);
    titleCell.value = "KM100 Skills and Training Center, Inc  Inventory Report";
    titleCell.font = {
      name: "Calibri",
      size: 17,
      bold: true,
      color: { argb: INK },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "left" };

    // Row 2: Location on left, Records & Exported date on the very right
    const locCell = sheet.getCell(`${leftCol}2`);
    locCell.value = `Location: ${sheetTitle}`;
    locCell.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: MUTED },
    };
    locCell.alignment = { vertical: "middle", horizontal: "left" };

    const infoCell = sheet.getCell(
      columnCount >= 3 ? `${rightSplitLetter}2` : `${lastLetter}2`,
    );
    infoCell.value = `Records: ${recordCount}   Exported: ${today}`;
    infoCell.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: MUTED },
    };
    infoCell.alignment = { vertical: "middle", horizontal: "right" };

    for (let c = 1; c <= columnCount; c++) {
      sheet.getRow(2).getCell(c).border = {
        bottom: { style: "medium", color: { argb: TABLE_BORDER } },
      };
    }

    if (logoId !== null) {
      try {
        // 62x62px logo centered cleanly inside Rows 1–2 on the left
        sheet.addImage(logoId, {
          tl: { col: 0.18, row: 0.14 },
          ext: { width: 62, height: 62 },
          editAs: "oneCell",
        });
      } catch {
        // Decorative image fallback
      }
    }

    // Row 3: Bold Orange Table Column Headers with bold white text
    const headerRowNum = 3;
    const headerRow = sheet.getRow(headerRowNum);
    headerRow.height = 28;
    headerRow.values = exportColumns.map((col) => col.label);
    headerRow.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    headerRow.eachCell((cell: any, colNumber: number) => {
      const col = exportColumns[colNumber - 1];
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: KM_ORANGE_HEADER },
      };
      cell.border = {
        top: { style: "medium", color: { argb: TABLE_BORDER } },
        bottom: { style: "medium", color: { argb: TABLE_BORDER } },
        left: { style: "thin", color: { argb: TABLE_BORDER } },
        right: { style: "thin", color: { argb: TABLE_BORDER } },
      };
      const headerAlign = col?.isNumber ? "center" : col?.align || "left";
      cell.alignment = {
        vertical: "middle",
        horizontal: headerAlign,
        indent: headerAlign === "left" ? col?.indent || 1 : 0,
      };
    });

    // Row 4+: Regular (non-bold) White Data Rows with orange gridlines
    const dataStartRow = 4;
    let totalUnits = 0;

    sheetItems.forEach((item, index) => {
      const rowNumber = dataStartRow + index;
      const row = sheet.getRow(rowNumber);
      row.height = 22;

      const roomName = item.room || roomNames.get(item.roomId) || "Unassigned";
      totalUnits += Number(item.quantity) || 0;
      row.values = exportColumns.map((col) => cellText(col, item, roomName));

      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        const col = exportColumns[colNumber - 1];
        cell.font = {
          name: "Calibri",
          size: 11,
          bold: false,
          color: { argb: "FF1E293B" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: TABLE_BORDER } },
          bottom: { style: "thin", color: { argb: TABLE_BORDER } },
          left: { style: "thin", color: { argb: TABLE_BORDER } },
          right: { style: "thin", color: { argb: TABLE_BORDER } },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        };

        if (!col) return;
        cell.alignment = {
          vertical: "middle",
          horizontal: col.align,
          indent: col.align === "left" ? col.indent || 1 : 0,
        };

        if (col.isNumber) {
          cell.numFmt = "#,##0";
          cell.font = {
            name: "Calibri",
            size: 11,
            bold: false,
            color: { argb: INK },
          };
        }

        if (col.isStatus) {
          const palette = statusPalette(cell.value);
          cell.font = {
            name: "Calibri",
            size: 11,
            bold: false,
            color: { argb: palette.font },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: palette.bg },
          };
          cell.border = {
            top: { style: "thin", color: { argb: TABLE_BORDER } },
            bottom: { style: "thin", color: { argb: TABLE_BORDER } },
            left: { style: "thin", color: { argb: TABLE_BORDER } },
            right: { style: "thin", color: { argb: TABLE_BORDER } },
          };
        }
      });
    });

    const lastDataRow = dataStartRow + recordCount - 1;

    if (recordCount > 0) {
      try {
        sheet.autoFilter = {
          from: { row: headerRowNum, column: 1 },
          to: { row: lastDataRow, column: columnCount },
        };
      } catch {
        sheet.autoFilter = `A${headerRowNum}:${lastLetter}${lastDataRow}`;
      }

      // Summary / Total Row
      const summaryRowNum = lastDataRow + 1;
      const summary = sheet.getRow(summaryRowNum);
      summary.height = 25;

      summary.getCell(1).value = "Total";
      summary.getCell(1).font = {
        name: "Calibri",
        size: 11,
        bold: false,
        color: { argb: INK },
      };
      summary.getCell(1).alignment = {
        vertical: "middle",
        horizontal: "left",
        indent: 1,
      };

      const qtyIndex = exportColumns.findIndex((col) => col.id === "quantity");
      if (qtyIndex !== -1) {
        const letter = columnLetter(qtyIndex + 1);
        const qtyCell = summary.getCell(qtyIndex + 1);
        qtyCell.value = {
          formula: `SUM(${letter}${dataStartRow}:${letter}${lastDataRow})`,
          result: totalUnits,
        };
        qtyCell.font = {
          name: "Calibri",
          size: 11,
          bold: false,
          color: { argb: INK },
        };
        qtyCell.alignment = {
          vertical: "middle",
          horizontal: "right",
          indent: 0,
        };
        qtyCell.numFmt = "#,##0";
      }

      summary.eachCell({ includeEmpty: true }, (cell: any) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF7ED" },
        };
        cell.border = {
          top: { style: "medium", color: { argb: TABLE_BORDER } },
          bottom: { style: "double", color: { argb: TABLE_BORDER } },
          left: { style: "thin", color: { argb: TABLE_BORDER } },
          right: { style: "thin", color: { argb: TABLE_BORDER } },
        };
      });
    }
  };

  const safeSheetName = (name: string, fallback: string) =>
    (name.replace(/[:\\/?*[\]]/g, "") || fallback).slice(0, 31);

  if (mode === "multi") {
    const master = workbook.addWorksheet("Master Inventory");
    populate(master, "All Facilities and Rooms", items, NAVY);

    rooms.forEach((room, index) => {
      const roomItems = items.filter((item) => item.roomId === room.id);
      const sheet = workbook.addWorksheet(safeSheetName(room.name, "Room"));
      const tabColor =
        ROOM_TAB_COLORS[room.id] ||
        FALLBACK_TAB_COLORS[index % FALLBACK_TAB_COLORS.length];
      populate(sheet, room.name, roomItems, tabColor);
    });
  } else {
    const roomName = selectedRoom?.name || "All Rooms";
    const sheet = workbook.addWorksheet(safeSheetName(roomName, "Inventory"));
    const tabColor = selectedRoom
      ? ROOM_TAB_COLORS[selectedRoom.id] || NAVY
      : NAVY;
    populate(sheet, roomName, currentItems, tabColor);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "KM100_Inventory_Export.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
