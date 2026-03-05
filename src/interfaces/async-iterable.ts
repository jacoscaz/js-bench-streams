/**
 * AsyncIterable / AsyncIterator implementation
 * 
 * Uses native async generators for the most idiomatic approach.
 */

import { transform1, transform2, transform3, resetChecksum, getChecksum } from '../transform.ts';

/** Create an async generator that yields numbers */
export async function* createSource(count: number): AsyncGenerator<number> {
  for (let i = 0; i < count; i++) {
    yield i;
  }
}

/** Transform via async generator */
export async function* transform1Async(
  source: AsyncIterable<number>
): AsyncGenerator<number> {
  for await (const value of source) {
    yield transform1(value);
  }
}

export async function* transform2Async(
  source: AsyncIterable<number>
): AsyncGenerator<number> {
  for await (const value of source) {
    yield transform2(value);
  }
}

export async function* transform3Async(
  source: AsyncIterable<number>
): AsyncGenerator<number> {
  for await (const value of source) {
    yield transform3(value);
  }
}

/** Run the full pipeline and consume results */
export async function runPipeline(count: number): Promise<number> {
  resetChecksum();
  
  let source = createSource(count);
  source = transform1Async(source);
  source = transform2Async(source);
  source = transform3Async(source);
  
  let itemCount = 0;
  for await (const _ of source) {
    itemCount++;
  }
  
  return itemCount;
}

/** Get checksum for verification */
export { getChecksum };
