import { describe, it, expect } from "vitest";
import { normalizeStatus, operationalPercent } from "../status";
import { makeUniqueSheetName, sanitizeFormulaCell } from "../spreadsheetSafety";
import { parseCsvText, parseImportRows } from "../csvImport";
import { buildInventoryCsv } from "../csvExport";
import {
  DEFAULT_FACILITIES,
  Facility,
  normalizeFacilityId,
  InventoryItem,
  Room,
  ColumnDefinition,
} from "../../types/inventory";

describe("Status normalization & operational metrics", () => {
  it("correctly classifies negated and past-tense phrases", () => {
    expect(normalizeStatus("not working")).toBe("Defective");
    expect(normalizeStatus("non-functional")).toBe("Defective");
    expect(normalizeStatus("unused")).toBe("Working");
    expect(normalizeStatus("repaired")).toBe("Working");
    expect(normalizeStatus("zero defects")).toBe("Defective");
    expect(normalizeStatus("Deffective")).toBe("Defective");
    expect(normalizeStatus("Deployed")).toBe("Deployed");
  });

  it("includes Deployed items in operationalPercent", () => {
    const items: InventoryItem[] = [
      {
        id: "1",
        roomId: "r1",
        name: "A",
        category: "Tools",
        quantity: 3,
        status: "Working",
        condition: "Working",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        roomId: "r1",
        name: "B",
        category: "Tools",
        quantity: 2,
        status: "Deployed",
        condition: "Deployed",
        createdAt: "",
        updatedAt: "",
      },
    ];
    expect(operationalPercent(items)).toBe(100);
  });
});

describe("Spreadsheet formula & sheet name safety", () => {
  it("neutralizes CWE-1236 formula prefixes", () => {
    expect(sanitizeFormulaCell("=CMD|' /C calc'!A0")).toBe(
      "'=CMD|' /C calc'!A0",
    );
    expect(sanitizeFormulaCell("+1+1")).toBe("'+1+1");
    expect(sanitizeFormulaCell("-SUM(A1:A2)")).toBe("'-SUM(A1:A2)");
    expect(sanitizeFormulaCell("@SUM(1,2)")).toBe("'@SUM(1,2)");
    expect(sanitizeFormulaCell("Normal Item")).toBe("Normal Item");
  });

  it("deduplicates sheet names within 31 chars and strips leading quotes", () => {
    const used = new Set<string>();
    const s1 = makeUniqueSheetName(
      "'Very Long Facility Room Name Number One",
      "Room",
      used,
    );
    const s2 = makeUniqueSheetName(
      "Very Long Facility Room Name Number Two",
      "Room",
      used,
    );
    const s3 = makeUniqueSheetName("master inventory", "Room", used);
    const s4 = makeUniqueSheetName("Master Inventory", "Room", used);
    expect(s1.length).toBeLessThanOrEqual(31);
    expect(s1.startsWith("'")).toBe(false);
    expect(s2.length).toBeLessThanOrEqual(31);
    expect(s1.toLowerCase()).not.toBe(s2.toLowerCase());
    expect(s3.toLowerCase()).not.toBe(s4.toLowerCase());
  });
});

describe("CSV BOM, unquoted quotes, zero qty & export sanitization", () => {
  it("strips UTF-8 BOM and handles unquoted inch marks", () => {
    const csv = '\uFEFFname,quantity,status\n3.5" HDD,0,Working\n';
    const rows = parseCsvText(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('3.5" HDD');

    const parsed = parseImportRows(rows, "room-1");
    expect(parsed[0].quantity).toBe(0);
  });

  it("sanitizes formula cells and uses canonical room name in CSV export", () => {
    const rooms: Room[] = [{ id: "r1", name: "Updated Room Name" }];
    const cols: ColumnDefinition[] = [
      { id: "name", label: "Name", type: "text", order: 1 },
      { id: "quantity", label: "Qty", type: "number", order: 2 },
    ];
    const items: InventoryItem[] = [
      {
        id: "1",
        roomId: "r1",
        room: "Stale Room Name",
        name: "=1+1",
        category: "General",
        quantity: 4,
        status: "Working",
        condition: "Working",
        createdAt: "",
        updatedAt: "",
      },
    ];
    const csv = buildInventoryCsv(items, rooms, cols);
    expect(csv).toContain("'=1+1");
    expect(csv).toContain("Updated Room Name");
    expect(csv).not.toContain("Stale Room Name");
  });
});

describe("Custom facility normalization priority", () => {
  it("prioritizes exact facility matches over default substring aliases", () => {
    const customList: Facility[] = [
      ...DEFAULT_FACILITIES,
      {
        id: "fac-eastcoast",
        code: "EC",
        name: "EastCoast",
        shortName: "EastCoast",
        fullName: "EastCoast Branch",
        description: "Contains 'stc' substring",
      },
      {
        id: "fac-petc-2",
        code: "PETC2",
        name: "PETC Branch 2",
        shortName: "PETC 2",
        fullName: "PETC Branch 2",
        description: "Second PETC branch",
      },
    ];

    expect(normalizeFacilityId("EastCoast", customList)).toBe("fac-eastcoast");
    expect(normalizeFacilityId("fac-petc-2", customList)).toBe("fac-petc-2");
    expect(normalizeFacilityId("PETC Branch 2", customList)).toBe("fac-petc-2");
  });
});
