import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ColumnDefinition, InventoryItem, Room } from '../../types/inventory';

// vi.mock is hoisted above these declarations, so the fns must be created
// inside vi.hoisted() to avoid a temporal-dead-zone ReferenceError.
const { mockWriteFile, mockBookNew, mockBookAppend, mockAoaToSheet } = vi.hoisted(() => ({
  mockWriteFile: vi.fn(),
  mockBookNew: vi.fn(() => ({} as any)),
  mockBookAppend: vi.fn(),
  mockAoaToSheet: vi.fn(() => ({} as any))
}));

// Hoisted mock replaces 'xlsx' before the module under test imports it.
vi.mock('xlsx', () => ({
  utils: {
    book_new: mockBookNew,
    book_append_sheet: mockBookAppend,
    aoa_to_sheet: mockAoaToSheet
  },
  writeFile: mockWriteFile,
  __esModule: true,
  default: {
    utils: { book_new: mockBookNew, book_append_sheet: mockBookAppend, aoa_to_sheet: mockAoaToSheet },
    writeFile: mockWriteFile
  }
}));

import { exportInventoryToExcel } from '../excelExport';

beforeEach(() => {
  mockWriteFile.mockClear();
  mockBookNew.mockClear();
  mockBookAppend.mockClear();
  mockAoaToSheet.mockClear();
});

const rooms: Room[] = [
  { id: 'room-1', name: 'Room One', description: 'First room' },
  { id: 'room-2', name: 'Room Two', description: 'Second room' }
];

const items: InventoryItem[] = [
  {
    id: 'item-1',
    roomId: 'room-1',
    name: 'Hammer',
    category: 'Tools',
    quantity: 2,
    units: 'pcs',
    status: 'Working',
    condition: 'Working',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'item-2',
    roomId: 'room-1',
    name: 'Wrench',
    category: 'Tools',
    quantity: 5,
    units: 'pcs',
    status: 'Working',
    condition: 'Working',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

const columns: ColumnDefinition[] = [
  { id: 'name', label: 'ITEM NAME', type: 'text', required: true, isSystem: true, order: 1 },
  { id: 'category', label: 'CATEGORY', type: 'dropdown', options: ['Tools'], required: true, order: 2 },
  { id: 'quantity', label: 'QUANTITY', type: 'number', required: true, isSystem: true, order: 3 },
  { id: 'units', label: 'UNITS', type: 'dropdown', options: ['pcs'], required: true, order: 4 },
  { id: 'status', label: 'Status', type: 'dropdown', options: ['Working'], required: true, order: 5 }
];

describe('exportInventoryToExcel', () => {
  it('calls XLSX.writeFile with a branded KM100 filename', () => {
    exportInventoryToExcel('multi', rooms, items, columns);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const filename = mockWriteFile.mock.calls[0][1];
    expect(typeof filename).toBe('string');
    expect(filename).toContain('KM100');
    expect(filename).toContain('.xlsx');
  });

  it('creates a master sheet plus one sheet per room (multi mode)', () => {
    exportInventoryToExcel('multi', rooms, items, columns);
    expect(mockBookNew).toHaveBeenCalledTimes(1);
    // 1 master + 2 room sheets
    expect(mockBookAppend).toHaveBeenCalledTimes(3);
    expect(mockAoaToSheet).toHaveBeenCalledTimes(3);
  });

  it('creates a single sheet in current mode', () => {
    exportInventoryToExcel('current', rooms, items, columns, rooms[0]);
    expect(mockBookAppend).toHaveBeenCalledTimes(1);
    expect(mockAoaToSheet).toHaveBeenCalledTimes(1);
  });
});
