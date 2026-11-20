import { describe, it, expect } from 'vitest';
import { parseCsvText, parseImportRows } from '../csvImport';

describe('parseCsvText', () => {
  it('parses a simple header + rows', () => {
    const text = 'name,category,quantity\nHammer,Tools,2\nWrench,Tools,5';
    const rows = parseCsvText(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Hammer', category: 'Tools', quantity: '2' });
    expect(rows[1]).toEqual({ name: 'Wrench', category: 'Tools', quantity: '5' });
  });

  it('handles quoted fields containing commas', () => {
    const text = 'name,remarks\n"Hammer, claw",Good condition\n"Screwdriver, Phillips",New';
    const rows = parseCsvText(text);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Hammer, claw');
    expect(rows[1].name).toBe('Screwdriver, Phillips');
  });

  it('trims whitespace around headers and values', () => {
    const text = ' name , category \n Hammer , Tools ';
    const rows = parseCsvText(text);
    expect(rows[0].name).toBe('Hammer');
    expect(rows[0].category).toBe('Tools');
  });

  it('returns empty array for empty input', () => {
    expect(parseCsvText('')).toEqual([]);
    expect(parseCsvText('\n\n')).toEqual([]);
  });
});

describe('parseImportRows', () => {
  it('maps CSV rows to inventory item shapes with a default room', () => {
    const rows = parseCsvText('name,category,quantity,units,status\nHammer,Tools,2,pcs,Working');
    const items = parseImportRows(rows, 'room-ccs');
    expect(items).toHaveLength(1);
    expect(items[0].id).toMatch(/^import-/);
    expect(items[0].roomId).toBe('room-ccs');
    expect(items[0].name).toBe('Hammer');
    expect(items[0].category).toBe('Tools');
    expect(items[0].quantity).toBe(2);
    expect(items[0].units).toBe('pcs');
    expect(items[0].status).toBe('Working');
    expect(items[0].condition).toBe('Working');
    expect(typeof items[0].createdAt).toBe('string');
  });

  it('uses row roomId when provided', () => {
    const rows = parseCsvText('name,roomId,category\nHammer,room-lib,Tools');
    const items = parseImportRows(rows, 'room-ccs');
    expect(items[0].roomId).toBe('room-lib');
  });

  it('defaults quantity to 1 when missing/invalid', () => {
    const rows = parseCsvText('name,quantity\nHammer,\nWrench,abc');
    const items = parseImportRows(rows, 'room-ccs');
    expect(items[0].quantity).toBe(1);
    expect(items[1].quantity).toBe(1);
  });

  it('handles empty rows array', () => {
    expect(parseImportRows([], 'room-ccs')).toEqual([]);
  });
});
