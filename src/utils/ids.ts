/**
 * One ID scheme for the whole system. The deployed app uses three
 * (`km100-001`, `item-<ts>`, `km100-<ts>`); everything new goes through here.
 */
function randomSuffix(length = 5): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export function generateItemId(): string {
  return `km100-${Date.now().toString(36)}-${randomSuffix()}`;
}

export function generateRoomId(): string {
  return `room-${Date.now().toString(36)}-${randomSuffix(4)}`;
}
