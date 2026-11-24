import { InventoryItem, ItemStatus } from "../types/inventory";

/**
 * Canonical KM100 condition vocabulary. Legacy exports use "Deffective" and
 * ad-hoc phrases ("Needs Repair", "Out of stock"), so every ingest path must
 * pass through `normalizeStatus` before storing.
 */
export const STATUS_OPTIONS: ItemStatus[] = [
  "Working",
  "Used",
  "Defective",
  "Empty",
  "Incomplete",
];

const CANONICAL = new Set<string>(STATUS_OPTIONS);

export function normalizeStatus(raw: unknown): ItemStatus {
  const value = String(raw ?? "").trim();
  if (!value) return "Working";
  if (CANONICAL.has(value)) return value;

  const s = value.toLowerCase();

  // Order matters: "incomplete" must be checked before looser matches.
  if (
    s.includes("incomplete") ||
    s.includes("partial") ||
    s.includes("missing")
  )
    return "Incomplete";
  if (
    s.includes("defect") ||
    s.includes("defective") ||
    s.includes("deffective")
  )
    return "Defective";
  if (
    s.includes("dmg") ||
    s.includes("damage") ||
    s.includes("broken") ||
    s.includes("repair") ||
    s.includes("condemn")
  )
    return "Defective";
  if (
    s.includes("empty") ||
    s.includes("deplet") ||
    s.includes("out of stock") ||
    s === "out" ||
    s.includes("zero")
  )
    return "Empty";
  if (
    s.includes("used") ||
    s.includes("fair") ||
    s.includes("wear") ||
    s.includes("moderate")
  )
    return "Used";
  if (
    s.includes("work") ||
    s.includes("good") ||
    s.includes("functional") ||
    s === "ok"
  )
    return "Working";

  return "Working";
}

/** Normalize both mirrored fields on an item so `status` and `condition` agree. */
export function withNormalizedStatus<T extends Partial<InventoryItem>>(
  item: T,
): T {
  const status = normalizeStatus(item.status ?? item.condition);
  return { ...item, status, condition: status };
}

/** Items that need an auditor's attention: broken, empty, incomplete, or zero stock. */
export function isNeedsAttention(item: Partial<InventoryItem>): boolean {
  const status = normalizeStatus(item.status ?? item.condition);
  if (status === "Defective" || status === "Empty" || status === "Incomplete")
    return true;
  return Number(item.quantity ?? 0) <= 0;
}

/** Items that are out of stock (quantity <= 0) or explicitly marked Empty. */
export function isOutOfStockOrEmpty(item: Partial<InventoryItem>): boolean {
  const status = normalizeStatus(item.status ?? item.condition);
  if (status === "Empty") return true;
  return Number(item.quantity ?? 0) <= 0;
}

/** Working / Used units, expressed as a share of all tracked units. */
export function operationalPercent(items: InventoryItem[]): number {
  let total = 0;
  let operational = 0;
  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    total += qty;
    const status = normalizeStatus(item.status ?? item.condition);
    if (status === "Working" || status === "Used") operational += qty;
  });
  return total > 0 ? Math.round((operational / total) * 100) : 100;
}
