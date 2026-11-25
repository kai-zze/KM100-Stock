export type ColumnType = "text" | "number" | "dropdown";

export interface ColumnDefinition {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[];
  required?: boolean;
  isSystem?: boolean;
  order: number;
}

export type ItemStatus =
  | "Working"
  | "Deployed"
  | "Empty"
  | "Defective"
  | "Used"
  | "Incomplete"
  | (string & {});
export type ItemCondition = ItemStatus;

// ── Multi-Facility Governance ────────────────────────────────────────────────
export type FacilityId = string;

export interface Facility {
  id: string;
  code: string;
  name: string;
  shortName: string;
  fullName: string;
  description: string;
  badgeClass?: string;
  isSystem?: boolean;
}

export const DEFAULT_FACILITIES: Facility[] = [
  {
    id: "fac-km100-stc",
    code: "KM100",
    name: "KM100 Skills and Training Center, Inc.",
    shortName: "KM100",
    fullName: "KM100 Skills and Training Center, Inc.",
    description:
      "Vocational labs, computer rooms & technical training workshops",
    badgeClass:
      "text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800",
    isSystem: true,
  },
  {
    id: "fac-petc",
    code: "PETC",
    name: "PETC",
    shortName: "PETC",
    fullName: "Private Emission Testing Center",
    description:
      "Emission testing lanes, diagnostic calibration & LTO compliance",
    badgeClass:
      "text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/60 dark:border-blue-800",
  },
  {
    id: "fac-knoah-mari",
    code: "KM",
    name: "Knoah Mari",
    shortName: "Knoah Mari",
    fullName: "Knoah Mari Café & Events",
    description: "Heritage café, espresso bar, artisan baking & event venue",
    badgeClass:
      "text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800",
  },
  {
    id: "fac-red-goose",
    code: "RG",
    name: "Red Goose",
    shortName: "Red Goose",
    fullName: "Red Goose Resto & Café",
    description:
      "Restaurant dining floor, commercial grill, bar & cold storage",
    badgeClass:
      "text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800",
  },
];

export const FACILITIES: Facility[] = DEFAULT_FACILITIES;

export const DEFAULT_FACILITY_ID: FacilityId = "fac-km100-stc";

function findMatchingFacility(
  val: string,
  facilitiesList: Facility[],
): Facility | undefined {
  const clean = val.trim();
  const lower = clean.toLowerCase();

  // Pass 1: exact ID, code, name, or shortName matches take precedence over
  // loose substring aliases so custom facilities (e.g. "fac-petc-2", "EastCoast")
  // are never hijacked by DEFAULT_FACILITIES.
  const exactMatch = facilitiesList.find(
    (f) =>
      f &&
      (f.id === clean ||
        (f.id && f.id.toLowerCase() === lower) ||
        (f.code && f.code.toLowerCase() === lower) ||
        (f.name && f.name.toLowerCase() === lower) ||
        (f.shortName && f.shortName.toLowerCase() === lower)),
  );
  if (exactMatch) return exactMatch;

  // Pass 2: legacy / abbreviation aliases
  return facilitiesList.find(
    (f) =>
      f &&
      ((f.id === "fac-km100-stc" &&
        (clean === "STC" ||
          lower.includes("stc") ||
          lower.includes("km100") ||
          lower.includes("training"))) ||
        (f.id === "fac-petc" && lower.includes("petc")) ||
        (f.id === "fac-knoah-mari" &&
          (lower.includes("knoah") || lower === "km")) ||
        (f.id === "fac-red-goose" &&
          (lower.includes("goose") || lower === "rg"))),
  );
}

export function normalizeFacilityId(
  val?: string | null,
  customFacilities: Facility[] = DEFAULT_FACILITIES,
): FacilityId {
  if (!val) return DEFAULT_FACILITY_ID;
  const clean = val.trim();
  if (!clean) return DEFAULT_FACILITY_ID;

  const facilitiesList =
    Array.isArray(customFacilities) && customFacilities.length > 0
      ? customFacilities
      : DEFAULT_FACILITIES;

  const match = findMatchingFacility(clean, facilitiesList);
  return match ? match.id : clean;
}

export function getFacility(
  val?: string | null,
  customFacilities: Facility[] = DEFAULT_FACILITIES,
): Facility {
  const fallback =
    (Array.isArray(customFacilities) && customFacilities[0]) ||
    DEFAULT_FACILITIES[0];
  if (!val) return fallback;
  const clean = val.trim();
  if (!clean) return fallback;

  const facilitiesList =
    Array.isArray(customFacilities) && customFacilities.length > 0
      ? customFacilities
      : DEFAULT_FACILITIES;

  const match = findMatchingFacility(clean, facilitiesList);
  if (match) return match;

  return {
    id: clean,
    code: clean.slice(0, 4).toUpperCase(),
    name: clean,
    shortName: clean.slice(0, 10),
    fullName: clean,
    description: "Facility location",
    badgeClass:
      "text-slate-800 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800",
  };
}

// Canonical statuses used across seed data, default columns, badges, and dashboard.
// 'Deffective' (misspelling) is accepted in legacy data but normalized to 'Defective'.
export const ITEM_STATUSES: ItemStatus[] = [
  "Working",
  "Deployed",
  "Empty",
  "Defective",
  "Used",
  "Incomplete",
];

export interface InventoryItem {
  id: string;
  roomId: string;
  facility?: FacilityId | string;
  name: string;
  category: string;
  quantity: number;
  units?: string;
  status?: ItemStatus;
  condition?: ItemCondition;
  room?: string;
  remarks?: string;
  deployedTo?: string;
  deployedLocation?: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  facility?: FacilityId | string;
}

export type UserRole = "admin" | "staff";

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface AppBackup {
  version: string;
  organization: string;
  exportedAt: string;
  rooms: Room[];
  columns: ColumnDefinition[];
  items: InventoryItem[];
}
