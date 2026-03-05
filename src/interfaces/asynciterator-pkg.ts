/**
 * asynciterator package implementation
 * 
 * Uses the asynciterator npm package which provides an event-based
 * approach to asynchronous iteration.
 */

import { IntegerIterator, AsyncIterator } from 'asynciterator';
import { transform1, transform2, transform3, resetChecksum, getChecksum } from '../transform.ts';

/** Create an IntegerIterator source */
export function createSource(count: number): AsyncIterator<number> {
  return new IntegerIterator({ start: 0, end: count - 1 });
}

/** Create a transformed AsyncIterator using map */
function createTransformed(
  source: AsyncIterator<number>,
  fn: (value: number) => number
): AsyncIterator<number> {
  return source.map(fn);
}

/** Run the full pipeline and consume results */
export async function runPipeline(count: number): Promise<number> {
  resetChecksum();
  
  let iter = createSource(count);
  iter = createTransformed(iter, transform1);
  iter = createTransformed(iter, transform2);
  iter = createTransformed(iter, transform3);
  
  let itemCount = 0;
  
  return new Promise((resolve, reject) => {
    iter.on('data', () => {
      itemCount++;
    });
    iter.on('end', () => {
      resolve(itemCount);
    });
    iter.on('error', reject);
  });
}

/** Get checksum for verification */
export { getChecksum };
