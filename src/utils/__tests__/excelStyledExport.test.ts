import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  ColumnDefinition,
  InventoryItem,
  Room,
} from "../../types/inventory";

const rooms: Room[] = [
  { id: "room-1", name: "Room One", description: "First room" },
  { id: "room-2", name: "Room Two", description: "Second room" },
];

const items: InventoryItem[] = [
  {
    id: "item-1",
    roomId: "room-1",
    name: "Hammer",
    category: "Tools",
    quantity: 2,
    units: "pcs",
    status: "Working",
    condition: "Working",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const columns: ColumnDefinition[] = [
  {
    id: "name",
    label: "ITEM NAME",
    type: "text",
    required: true,
    isSystem: true,
    order: 1,
  },
  {
    id: "quantity",
    label: "QUANTITY",
    type: "number",
    required: true,
    isSystem: true,
    order: 2,
  },
  {
    id: "status",
    label: "Status",
    type: "dropdown",
    options: ["Working"],
    required: true,
    order: 3,
  },
];

// ── Mock exceljs ──────────────────────────────────────────────────────
const mockWriteBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(8)));
const mockAddImage = vi.fn(() => 0);

function colLetterToIndex(letters: string): number {
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64);
  }
  return n;
}

function makeMockSheet() {
  const cells: Record<string, any> = {};
  const rows: Record<number, any> = {};
  const cellFor = (row: number, col: number) => {
    const key = `${row}-${col}`;
    if (!cells[key]) {
      cells[key] = {
        value: null,
        font: null,
        alignment: null,
        fill: null,
        border: null,
        numFmt: null,
      };
    }
    return cells[key];
  };
  return {
    columns: [],
    views: [],
    properties: { tabColor: null },
    pageSetup: null,
    autoFilter: null,
    addImage: vi.fn(),
    mergeCells: vi.fn(),
    // Sheet-level getCell accepts ExcelJS address forms: 'B2' or {row, col}.
    getCell: vi.fn((addr: any) => {
      let row = 1;
      let col = 1;
      if (typeof addr === "string") {
        const m = addr.match(/^([A-Z]+)(\d+)$/);
        if (m) {
          col = colLetterToIndex(m[1]);
          row = parseInt(m[2], 10);
        }
      } else if (addr && typeof addr === "object") {
        row = addr.row;
        col = addr.col;
      } else {
        row = addr;
      }
      return cellFor(row, col);
    }),
    getRow: vi.fn((n: number) => {
      if (!rows[n]) {
        rows[n] = {
          height: null,
          values: null,
          eachCell: vi.fn(),
          getCell: vi.fn((c: number) => cellFor(n, c)),
        };
      }
      return rows[n];
    }),
  };
}
const mockAddWorksheet = vi.fn(() => makeMockSheet());

function installExcelJsMock(workbookIsFunction: boolean) {
  vi.doMock("exceljs", () => ({
    __esModule: true,
    default: {
      Workbook: workbookIsFunction
        ? class {
            creator = "";
            lastModifiedBy = "";
            created: any;
            addWorksheet = mockAddWorksheet;
            addImage = mockAddImage;
            xlsx = { writeBuffer: mockWriteBuffer };
          }
        : "not-a-function",
    },
  }));
}

// ── Browser download stubs ────────────────────────────────────────────
const createObjectURL = vi.fn(() => "mocked-url");
const revokeObjectURL = vi.fn();
const mockLink = { href: "", download: "", click: vi.fn() };

let origURL: any;
let origBlob: any;
let origCreateElement: any;
let origBodyAppendChild: any;
let origBodyRemoveChild: any;

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  origURL = globalThis.URL;
  origBlob = globalThis.Blob;
  origCreateElement = document.createElement;
  origBodyAppendChild = document.body.appendChild;
  origBodyRemoveChild = document.body.removeChild;
  globalThis.URL = { createObjectURL, revokeObjectURL } as any;
  globalThis.Blob = class {} as any;
  document.body.appendChild = vi.fn();
  document.body.removeChild = vi.fn();
  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "a") return mockLink;
    return origCreateElement.call(document, tag);
  });
});

afterEach(() => {
  globalThis.URL = origURL;
  globalThis.Blob = origBlob;
  document.createElement = origCreateElement;
  document.body.appendChild = origBodyAppendChild;
  document.body.removeChild = origBodyRemoveChild;
  vi.restoreAllMocks();
});

describe("exportInventoryToStyledExcel", () => {
  it("multi mode: builds master + room sheets, writes buffer, triggers download", async () => {
    installExcelJsMock(true);
    const { exportInventoryToStyledExcel } =
      await import("../excelStyledExport");

    const ok = await exportInventoryToStyledExcel({
      mode: "multi",
      rooms,
      items,
      currentItems: items,
      columns,
    });

    expect(ok).toBe(true);
    // 1 master sheet + 1 sheet per room
    expect(mockAddWorksheet).toHaveBeenCalledTimes(3);
    expect(mockWriteBuffer).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    // download link created and clicked
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.click).toHaveBeenCalledTimes(1);
  });

  it("current mode: builds a single sheet and writes buffer with formula summary", async () => {
    installExcelJsMock(true);
    const { exportInventoryToStyledExcel } =
      await import("../excelStyledExport");

    const ok = await exportInventoryToStyledExcel({
      mode: "current",
      rooms,
      items,
      currentItems: items,
      columns,
      selectedRoom: rooms[0],
    });

    expect(ok).toBe(true);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(1);
    expect(mockWriteBuffer).toHaveBeenCalledTimes(1);

    const sheet = mockAddWorksheet.mock.results[0].value;
    // Quantity column is index 2. Summary row is row 5 (header at 3 + 1 data row at 4).
    const summaryQtyCell = sheet.getRow(5).getCell(2);
    expect(summaryQtyCell.value).toEqual({
      formula: "SUM(B4:B4)",
      result: 2,
    });
  });

  it("returns false when ExcelJS.Workbook is not a function", async () => {
    installExcelJsMock(false);
    const { exportInventoryToStyledExcel } =
      await import("../excelStyledExport");

    const ok = await exportInventoryToStyledExcel({
      mode: "current",
      rooms,
      items,
      currentItems: items,
      columns,
    });

    expect(ok).toBe(false);
    expect(mockWriteBuffer).not.toHaveBeenCalled();
  });
});
