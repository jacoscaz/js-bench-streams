/**
 * Node Streams implementation
 * 
 * Uses the 'readable-stream' package for cross-runtime compatibility.
 */

import { Readable, Transform, Writable } from 'readable-stream';
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
function createTransformStream(fn: (value: number) => number): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk: number, _encoding, callback) {
      this.push(fn(chunk));
      callback();
    }
  });
}

/** Run the full pipeline and consume results */
export async function runPipeline(count: number): Promise<number> {
  resetChecksum();
  
  return new Promise((resolve, reject) => {
    let itemCount = 0;
    
    const source = createSource(count);
    const t1 = createTransformStream(transform1);
    const t2 = createTransformStream(transform2);
    const t3 = createTransformStream(transform3);
    
    const sink = new Writable({
      objectMode: true,
      write(_chunk: number, _encoding, callback) {
        itemCount++;
        callback();
      }
    });
    
    source
      .on('error', reject)
      .pipe(t1)
      .on('error', reject)
      .pipe(t2)
      .on('error', reject)
      .pipe(t3)
      .on('error', reject)
      .pipe(sink)
      .on('error', reject)
      .on('finish', () => resolve(itemCount));
  });
}

/** Get checksum for verification */
export { getChecksum };
