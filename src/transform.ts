/**
 * Shared transformation logic for all streaming interfaces.
 * 
 * These are pure functions that perform CPU-bound work with observable
 * side effects (via checksum accumulation) to prevent JIT optimization.
 */

/** Accumulator for side effects - prevents optimization */
export let checksum = 0;

/** Reset checksum between benchmark runs */
export function resetChecksum(): void {
  checksum = 0;
}

/** Get and verify checksum - ensures transformations actually ran */
export function getChecksum(): number {
  return checksum;
}

/**
 * Transformation 1: Double and add to checksum
 * Simulates a simple numeric transformation with side effect
 */
export function transform1(value: number): number {
  const result = value * 2;
  checksum = (checksum + result) % 1000000007; // Large prime to avoid overflow
  return result;
}

/**
 * Transformation 2: Square root floor and add to checksum
 * Different operation profile than transform1
 */
export function transform2(value: number): number {
  const result = Math.floor(Math.sqrt(Math.abs(value)));
  checksum = (checksum + result) % 1000000007;
  return result;
}

/**
 * Transformation 3: Bitwise rotation simulation
 * Intentionally not using bitwise operators for cross-platform consistency
 */
export function transform3(value: number): number {
  const result = Math.abs(Math.sin(value) * 10000) | 0;
  checksum = (checksum + result) % 1000000007;
  return result;
}

/** Chain of transformations for benchmarking */
export const transforms = [transform1, transform2, transform3] as const;

/** Apply a chain of transformations */
export function applyTransforms(value: number): number {
  return transforms.reduce((v, fn) => fn(v), value);
}
