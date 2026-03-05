/**
 * Web Streams implementation
 * 
 * Uses the standard ReadableStream API with TransformStream.
 */

import { transform1, transform2, transform3, resetChecksum, getChecksum } from '../transform.ts';

/** Create a ReadableStream that yields numbers */
export function createSource(count: number): ReadableStream<number> {
  let i = 0;
  return new ReadableStream<number>({
    pull(controller) {
      if (i < count) {
        controller.enqueue(i);
        i++;
      } else {
        controller.close();
      }
    }
  });
}

/** Create a TransformStream for a transformation function */
function createTransform(fn: (value: number) => number): TransformStream<number, number> {
  return new TransformStream<number, number>({
    transform(chunk, controller) {
      controller.enqueue(fn(chunk));
    }
  });
}

/** Run the full pipeline and consume results */
export async function runPipeline(count: number): Promise<number> {
  resetChecksum();
  
  let stream = createSource(count);
  stream = stream.pipeThrough(createTransform(transform1));
  stream = stream.pipeThrough(createTransform(transform2));
  stream = stream.pipeThrough(createTransform(transform3));
  
  const reader = stream.getReader();
  let itemCount = 0;
  
  while (true) {
    const { done } = await reader.read();
    if (done) break;
    itemCount++;
  }
  
  return itemCount;
}

/** Get checksum for verification */
export { getChecksum };
