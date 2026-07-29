/**
 * Deterministic, dependency-free id generator (no crypto.randomUUID) so unit tests
 * and save/load fixtures stay reproducible across runs.
 */
let counter = 0;

export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

export function resetIdCounter(): void {
  counter = 0;
}
