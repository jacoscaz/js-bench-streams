/**
 * Node Streams implementation
 *
 * Uses the 'readable-stream' package for cross-runtime compatibility.
 */

import { Readable, Writable } from 'readable-stream';
import { transform1, transform2, transform3, resetChecksum, getChecksum } from '../transform.ts';

/** Create a Readable that yields numbers */
export function createSource(count: number): Readable {
  let i = 0;
  return new Readable({
    objectMode: true,
    read() {
      if (i < count) {
        this.push(i);
        i++;
      } else {
        this.push(null);
      }
    }
  });
}

/** Create a Transform for a transformation function */
function createTransformStream(source: Readable, fn: (value: number) => number): Readable {
  return source.map(fn);
}

/** Run the full pipeline and consume results */
export async function runPipeline(count: number): Promise<number> {
  resetChecksum();

  return new Promise((resolve, reject) => {
    let itemCount = 0;

    let stream = createSource(count);
    stream = createTransformStream(stream, transform1);
    stream = createTransformStream(stream, transform2);
    stream = createTransformStream(stream, transform3);

    const sink = new Writable({
      objectMode: true,
      write(_chunk: number, _encoding, callback) {
        itemCount++;
        callback();
      }
    });

    stream
      .on('error', reject)
      .pipe(sink)
      .on('error', reject)
      .on('finish', () => resolve(itemCount));
  });
}

/** Get checksum for verification */
export { getChecksum };
