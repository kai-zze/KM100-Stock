/**
 * Shared spreadsheet safety helpers for CSV and Excel exports.
 * Prevents CWE-1236 formula injection and Excel worksheet name collisions.
 */

const FORMULA_PREFIX_RE = /^[=+\-@\t\r]/;

/**
 * Neutralizes spreadsheet formula injection (CWE-1236) on string values by
 * prefixing leading `=`, `+`, `-`, `@`, tab, or CR characters with a single quote.
 * Numeric values passed as `number` are preserved as real numbers.
 */
export function sanitizeFormulaCell(value: string): string {
  if (!value) return value;
  return FORMULA_PREFIX_RE.test(value) ? `'${value}` : value;
}

/**
 * Produces a valid, unique Excel worksheet name (<= 31 chars, no forbidden
 * characters or leading/trailing apostrophes, case-insensitively deduplicated).
 */
export function makeUniqueSheetName(
  rawName: string,
  fallback: string,
  usedNames: Set<string>,
): string {
  const cleaned = (rawName || "")
    .replace(/[:\\/?*[\]]/g, "")
    .replace(/^'+|'+$/g, "")
    .trim();
  const base = (cleaned || fallback).slice(0, 31);

  if (!usedNames.has(base.toLowerCase())) {
    usedNames.add(base.toLowerCase());
    return base;
  }

  let counter = 2;
  while (counter < 1000) {
    const suffix = ` (${counter})`;
    const candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    if (!usedNames.has(candidate.toLowerCase())) {
      usedNames.add(candidate.toLowerCase());
      return candidate;
    }
    counter += 1;
  }
  return base;
}
