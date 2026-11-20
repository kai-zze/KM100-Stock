import ExcelJS from 'exceljs';
import { ColumnDefinition, InventoryItem, Room } from '../types/inventory';
import { normalizeStatus } from './status';

interface ExportColumn {
  id: string;
  label: string;
  width: number;
  align: 'left' | 'right' | 'center';
  isNumber?: boolean;
  isStatus?: boolean;
  indent?: number;
}

const NAVY = 'FF1E3A8A';
const INK = 'FF0F172A';
const MUTED = 'FF475569';
const HAIRLINE = 'FFE2E8F0';

const ROOM_TAB_COLORS: Record<string, string> = {
  'room-ccs': 'FF2563EB',
  'room-admin': 'FF0D9488',
  'room-css': 'FFD97706',
  'room-bp': 'FF9333EA'
};

const FALLBACK_TAB_COLORS = ['FF64748B', 'FF7C3AED', 'FF0891B2', 'FFB45309'];

function statusPalette(raw: unknown) {
  const status = normalizeStatus(raw);
  switch (status) {
    case 'Working':
      return { bg: 'FFDCFCE7', font: 'FF15803D', border: 'FFA7F3D0' };
    case 'Used':
      return { bg: 'FFFEF3C7', font: 'FFB45309', border: 'FFFDE68A' };
    case 'Defective':
      return { bg: 'FFFFE4E6', font: 'FFBE123C', border: 'FFFECDD3' };
    case 'Incomplete':
      return { bg: 'FFFFEDD5', font: 'FFC2410C', border: 'FFFED7AA' };
    case 'Empty':
      return { bg: 'FFF1F5F9', font: 'FF475569', border: 'FFCBD5E1' };
    default:
      return { bg: 'FFF8FAFC', font: 'FF334155', border: 'FFE2E8F0' };
  }
}

/** Excel column letter for a 1-based index (1 -> A, 27 -> AA). */
function columnLetter(index: number): string {
  let letter = '';
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
    if (col.id === 'room' || col.id === 'roomId' || col.id === 'roomLocation') {
      hasRoom = true;
      resolved.push({ id: '_room', label: col.label || 'ROOM / FACILITY', width: 34, align: 'left' });
    } else if (col.id === 'name') {
      resolved.push({ id: 'name', label: col.label || 'ITEM NAME & DESCRIPTION', width: 56, align: 'left', indent: 1 });
    } else if (col.id === 'category') {
      resolved.push({ id: 'category', label: col.label || 'CATEGORY', width: 34, align: 'left' });
    } else if (col.id === 'quantity') {
      resolved.push({ id: 'quantity', label: col.label || 'QUANTITY', width: 20, align: 'right', isNumber: true });
    } else if (col.id === 'units') {
      resolved.push({ id: 'units', label: col.label || 'UNITS', width: 18, align: 'center' });
    } else if (col.id === 'status' || col.id === 'condition') {
      if (hasStatus) return;
      hasStatus = true;
      resolved.push({ id: '_status', label: col.label || 'STATUS / CONDITION', width: 24, align: 'center', isStatus: true });
    } else {
      resolved.push({
        id: col.id,
        label: col.label || col.id,
        width: Math.max(22, (col.label || '').length * 1.5 + 4),
        align: col.type === 'number' ? 'right' : 'left',
        isNumber: col.type === 'number'
      });
    }
  });

  if (!hasRoom) {
    resolved.push({ id: '_room', label: 'ROOM / FACILITY', width: 34, align: 'left' });
  }

  return resolved;
}

function cellText(column: ExportColumn, item: InventoryItem, roomName: string): string | number {
  if (column.id === '_room') return roomName;
  if (column.id === '_status') return normalizeStatus(item.status ?? item.condition);
  if (column.id === 'quantity') return Number(item.quantity) || 0;
  if (column.id === 'units') return item.units || 'pcs';
  const value = item[column.id];
  return value === undefined || value === null ? '' : (value as string | number);
}

async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        resolve(result.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, ''));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface StyledExportOptions {
  mode: 'multi' | 'current';
  rooms: Room[];
  /** Full catalog, used for the multi-sheet workbook. */
  items: InventoryItem[];
  /** Exact rows for the current view (already filtered and sorted). */
  currentItems: InventoryItem[];
  columns: ColumnDefinition[];
  selectedRoom?: Room;
}

/**
 * Institutional Excel export: banner, embedded logo, frozen panes, status
 * pills, autofilter, page setup, and a real =SUM() accounting total.
 *
 * Returns false when ExcelJS is unavailable so the caller can fall back to the
 * plain SheetJS writer.
 */
export async function exportInventoryToStyledExcel(
  options: StyledExportOptions
): Promise<boolean> {
  const { mode, rooms, items, currentItems, columns, selectedRoom } = options;

  if (!ExcelJS || typeof ExcelJS.Workbook !== 'function') return false;

  const exportColumns = resolveColumns(columns);
  const columnCount = exportColumns.length;
  const lastLetter = columnLetter(columnCount);
  const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
  const logo = await loadLogoBase64();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'KM100 Skills and Training Center, Inc.';
  workbook.lastModifiedBy = 'KM100 Inventory System';
  workbook.created = new Date();

  let logoId: number | null = null;
  if (logo) {
    try {
      logoId = workbook.addImage({ base64: logo, extension: 'png' });
    } catch {
      logoId = null;
    }
  }

  const populate = (sheet: any, sheetTitle: string, sheetItems: InventoryItem[], tabColor: string) => {
    sheet.columns = exportColumns.map((col) => {
      let longest = (col.label || '').length;
      sheetItems.forEach((item) => {
        const roomName = item.room || roomNames.get(item.roomId) || '';
        const text = String(cellText(col, item, roomName));
        if (text.length > longest) longest = text.length;
      });
      return { key: col.id, width: Math.max(col.width || 20, Math.min(68, longest + 6)) };
    });

    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 6, activeCell: 'A7', showGridLines: true }];
    if (tabColor) sheet.properties.tabColor = { argb: tabColor };

    sheet.pageSetup = {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
      printTitlesRow: '6:6'
    };

    // Banner rows 1-5
    sheet.getRow(1).height = 10;
    sheet.getRow(2).height = 24;
    sheet.getRow(3).height = 16;
    sheet.getRow(4).height = 18;
    sheet.getRow(5).height = 18;

    for (let r = 1; r <= 5; r++) {
      for (let c = 1; c <= columnCount; c++) {
        sheet.getRow(r).getCell(c).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }
        };
      }
    }

    const bannerEnd = columnCount > 2 ? columnLetter(columnCount - 1) : 'B';

    sheet.mergeCells(`B2:${bannerEnd}2`);
    const title = sheet.getCell('B2');
    title.value = 'KM100 SKILLS AND TRAINING CENTER, INC.';
    title.font = { name: 'Calibri', size: 16, bold: true, color: { argb: INK } };
    title.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.mergeCells(`B3:${bannerEnd}3`);
    const subtitle = sheet.getCell('B3');
    subtitle.value = 'KM100 Skills & Training Center \u2022 Inventory Management System';
    subtitle.font = { name: 'Calibri', size: 10, italic: true, color: { argb: MUTED } };
    subtitle.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.mergeCells(`B4:${bannerEnd}4`);
    const heading = sheet.getCell('B4');
    heading.value = 'OFFICIAL PHYSICAL INVENTORY REPORT & ASSET REGISTER';
    heading.font = { name: 'Calibri', size: 11, bold: true, color: { argb: NAVY } };
    heading.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.mergeCells(`B5:${bannerEnd}5`);
    const meta = sheet.getCell('B5');
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    meta.value = `Facility Location: ${sheetTitle}   |   Active Catalog: ${sheetItems.length} items   |   Exported: ${today}`;
    meta.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
    meta.alignment = { vertical: 'middle', horizontal: 'center' };

    for (let c = 1; c <= columnCount; c++) {
      sheet.getRow(5).getCell(c).border = {
        bottom: { style: 'double', color: { argb: NAVY } }
      };
    }

    if (logoId !== null) {
      try {
        sheet.addImage(logoId, {
          tl: { col: 0.15, row: 1.1 },
          ext: { width: 92, height: 76 },
          editAs: 'oneCell'
        });
      } catch {
        // Image is decorative; never fail the export over it.
      }
    }

    // Header row 6
    const headerRow = sheet.getRow(6);
    headerRow.height = 28;
    headerRow.values = exportColumns.map((col) => col.label);
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell: any, colNumber: number) => {
      const col = exportColumns[colNumber - 1];
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
      cell.border = {
        top: { style: 'medium', color: { argb: NAVY } },
        left: { style: 'thin', color: { argb: 'FF3B82F6' } },
        bottom: { style: 'medium', color: { argb: INK } },
        right: { style: 'thin', color: { argb: 'FF3B82F6' } }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: col?.align || 'center',
        indent: col?.indent || 1
      };
    });

    // Data rows
    let totalUnits = 0;
    sheetItems.forEach((item, index) => {
      const rowNumber = 7 + index;
      const row = sheet.getRow(rowNumber);
      row.height = 22;

      const roomName = item.room || roomNames.get(item.roomId) || 'Unassigned';
      totalUnits += Number(item.quantity) || 0;
      row.values = exportColumns.map((col) => cellText(col, item, roomName));

      const isEven = index % 2 === 1;
      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        const col = exportColumns[colNumber - 1];
        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1F2937' } };
        cell.border = {
          top: { style: 'thin', color: { argb: HAIRLINE } },
          left: { style: 'thin', color: { argb: HAIRLINE } },
          bottom: { style: 'thin', color: { argb: HAIRLINE } },
          right: { style: 'thin', color: { argb: HAIRLINE } }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' }
        };

        if (!col) return;
        cell.alignment = {
          vertical: 'middle',
          horizontal: col.align,
          indent: col.indent || 1
        };

        if (col.isNumber) {
          cell.numFmt = '#,##0';
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } };
        }

        if (col.isStatus) {
          const palette = statusPalette(cell.value);
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: palette.font } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: palette.bg } };
          cell.border = {
            top: { style: 'thin', color: { argb: palette.border } },
            left: { style: 'thin', color: { argb: palette.border } },
            bottom: { style: 'thin', color: { argb: palette.border } },
            right: { style: 'thin', color: { argb: palette.border } }
          };
        }
      });
    });

    if (sheetItems.length > 0) {
      try {
        sheet.autoFilter = {
          from: { row: 6, column: 1 },
          to: { row: 6 + sheetItems.length, column: columnCount }
        };
      } catch {
        // Older ExcelJS builds only accept the A1 range form.
        sheet.autoFilter = `A6:${lastLetter}${6 + sheetItems.length}`;
      }
    }

    // Accounting total row
    if (sheetItems.length > 0) {
      const summaryNumber = 7 + sheetItems.length;
      const summary = sheet.getRow(summaryNumber);
      summary.height = 26;

      summary.getCell(1).value = 'TOTAL INVENTORY SUMMARY';
      summary.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: NAVY } };
      summary.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

      if (columnCount > 1) {
        summary.getCell(2).value = `${sheetItems.length} catalog items registered`;
        summary.getCell(2).font = { name: 'Calibri', size: 10, italic: true, color: { argb: MUTED } };
        summary.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      }

      const qtyIndex = exportColumns.findIndex((col) => col.id === 'quantity');
      if (qtyIndex !== -1) {
        const letter = columnLetter(qtyIndex + 1);
        const qtyCell = summary.getCell(qtyIndex + 1);
        qtyCell.value = {
          formula: `SUM(${letter}7:${letter}${6 + sheetItems.length})`,
          result: totalUnits
        };
        qtyCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: INK } };
        qtyCell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
        qtyCell.numFmt = '#,##0';
      }

      const unitsIndex = exportColumns.findIndex((col) => col.id === 'units');
      if (unitsIndex !== -1) {
        const unitsCell = summary.getCell(unitsIndex + 1);
        unitsCell.value = 'units total';
        unitsCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
        unitsCell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      summary.eachCell({ includeEmpty: true }, (cell: any) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF94A3B8' } },
          bottom: { style: 'double', color: { argb: INK } },
          left: { style: 'thin', color: { argb: HAIRLINE } },
          right: { style: 'thin', color: { argb: HAIRLINE } }
        };
      });
    }
  };

  const safeSheetName = (name: string, fallback: string) =>
    (name.replace(/[:\\/?*[\]]/g, '') || fallback).slice(0, 31);

  if (mode === 'multi') {
    const master = workbook.addWorksheet('KM100 Master Inventory');
    populate(master, 'All Facilities & Training Rooms', items, NAVY);

    rooms.forEach((room, index) => {
      const roomItems = items.filter((item) => item.roomId === room.id);
      const sheet = workbook.addWorksheet(safeSheetName(room.name, 'Room'));
      const tabColor = ROOM_TAB_COLORS[room.id] || FALLBACK_TAB_COLORS[index % FALLBACK_TAB_COLORS.length];
      populate(sheet, room.name, roomItems, tabColor);
    });
  } else {
    const roomName = selectedRoom?.name || 'KM100 Inventory';
    const sheet = workbook.addWorksheet(safeSheetName(roomName, 'KM100 Inventory'));
    const tabColor = selectedRoom ? ROOM_TAB_COLORS[selectedRoom.id] || NAVY : NAVY;
    populate(sheet, roomName, currentItems, tabColor);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'KM100_Skills_and_Training_Center,_Inc._INVENTORY.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
