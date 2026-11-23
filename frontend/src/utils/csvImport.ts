// CSV import utilities for KM100 Inventory System
// Pure, testable logic for parsing CSV text into row objects.

export interface CsvRow {
  [key: string]: string;
}

/**
 * Minimal CSV parser. Handles quoted fields containing commas, quotes and
 * newlines. Returns an array of objects keyed by the header row. Unquoted
 * values are trimmed; quoted values are preserved verbatim.
 */
export function parseCsvText(text: string): CsvRow[] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
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

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      record.push(field);
      field = '';
    } else if (ch === '\n') {
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const rows = records.filter((r) => r.some((cell) => cell.trim().length > 0));
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj: CsvRow = {};
    header.forEach((h, idx) => {
      obj[h] = (cells[idx] ?? '').trim();
    });
    return obj;
  });
}

/**
 * Map parsed CSV rows into InventoryItem-shaped objects ready for insertion.
 * `defaultRoomId` is used when the row does not specify a room.
 */
export function parseImportRows(
  rows: CsvRow[],
  defaultRoomId: string
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
  return rows.map((row, index) => ({
    id: `import-${Date.now()}-${index}`,
    roomId: row.roomId || row.room || defaultRoomId,
    name: String(row.name || row['ITEM NAME'] || row['Item Name'] || `Imported Item ${index + 1}`),
    category: String(row.category || row.CATEGORY || 'General'),
    quantity: Number(row.quantity || row.QUANTITY || row.qty || 1) || 1,
    units: String(row.units || row.UNITS || 'pcs'),
    status: String(row.status || row.Status || row.condition || 'Working'),
    condition: String(row.condition || row.Condition || row.status || 'Working'),
    remarks: String(row.remarks || row.Remarks || ''),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}
