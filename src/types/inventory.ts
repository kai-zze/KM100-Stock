export type ColumnType = 'text' | 'number' | 'dropdown';

export interface ColumnDefinition {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[];
  required?: boolean;
  isSystem?: boolean;
  order: number;
}

export type ItemStatus = 'Working' | 'Empty' | 'Defective' | 'Used' | 'Incomplete' | string;
export type ItemCondition = ItemStatus;

// Canonical statuses used across seed data, default columns, badges, and dashboard.
// 'Deffective' (misspelling) is accepted in legacy data but normalized to 'Defective'.
export const ITEM_STATUSES: ItemStatus[] = ['Working', 'Empty', 'Defective', 'Used', 'Incomplete'];

export interface InventoryItem {
  id: string;
  roomId: string;
  name: string;
  category: string;
  quantity: number;
  units?: string;
  status?: ItemStatus;
  condition?: ItemCondition;
  room?: string;
  remarks?: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
}

export interface AppBackup {
  version: string;
  organization: string;
  exportedAt: string;
  rooms: Room[];
  columns: ColumnDefinition[];
  items: InventoryItem[];
}
