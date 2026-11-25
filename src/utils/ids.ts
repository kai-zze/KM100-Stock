/**
 * One ID scheme for the whole system. The deployed app uses three
 * (`km100-001`, `item-<ts>`, `km100-<ts>`); everything new goes through here.
 */
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function randomSuffix(length = 5): string {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
    }
  } catch {
    // Fallback below when Web Crypto is unavailable
  }
  let out = "";
  while (out.length < length) {
    out += Math.random().toString(36).slice(2);
  }
  return out.slice(0, length);
}

export function generateItemId(): string {
  return `km100-${Date.now().toString(36)}-${randomSuffix()}`;
}

export function generateRoomId(): string {
  return `room-${Date.now().toString(36)}-${randomSuffix(4)}`;
}
