/**
 * localStorage keys and the one-time bridge from the deployed standalone app.
 *
 * The standalone build writes `_v2` keys; the modular app writes `_v1`. Without
 * this bridge, opening the new build looks like every record vanished.
 */
export const STORAGE_KEYS = {
  rooms: 'km100_inventory_rooms_v1',
  items: 'km100_inventory_items_v1',
  columns: 'km100_inventory_columns_v1',
  theme: 'km100_inventory_theme_v1',
  hiddenColumns: 'km100_hidden_columns_v1'
} as const;

const LEGACY_KEYS: Record<string, string> = {
  rooms: 'km100_inventory_rooms_v2',
  items: 'km100_inventory_items_v2',
  columns: 'km100_inventory_columns_v2',
  theme: 'km100_inventory_theme_v2',
  hiddenColumns: 'km100_hidden_columns_v2'
};

export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Read a key, falling back to the legacy standalone key exactly once. The
 * legacy value is copied into the current key so later reads never resurrect
 * data the user deleted in the new app.
 */
export function loadPersisted<T>(key: StorageKey, fallback: T): T {
  try {
    const current = localStorage.getItem(STORAGE_KEYS[key]);
    if (current !== null) return JSON.parse(current) as T;

    const legacyKey = LEGACY_KEYS[key];
    const legacy = legacyKey ? localStorage.getItem(legacyKey) : null;
    if (legacy !== null) {
      const parsed = JSON.parse(legacy) as T;
      localStorage.setItem(STORAGE_KEYS[key], legacy);
      return parsed;
    }
  } catch {
    // Corrupt JSON or storage disabled: use the seed data.
  }
  return fallback;
}

export function savePersisted(key: StorageKey, value: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch {
    // Quota exceeded or private mode: keep running from memory.
  }
}
