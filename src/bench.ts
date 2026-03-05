/**
 * Stream Interface Benchmarks
 *
 * Measures overhead of different streaming solutions for CPU-bound
 * transformation chains.
 */

import { bench, group, run } from 'mitata';
import { runPipeline as runAsyncIterable, getChecksum as getChecksumAsyncIter } from './interfaces/async-iterable.ts';
import { runPipeline as runWebStreams, getChecksum as getChecksumWeb } from './interfaces/web-streams.ts';
import { runPipeline as runNodeStreams, getChecksum as getChecksumNode } from './interfaces/node-streams.ts';
import { runPipeline as runNodeStreamsMap, getChecksum as getChecksumNodeMap } from './interfaces/node-streams.ts';
import { runPipeline as runAsyncIteratorPkg, getChecksum as getChecksumPkg } from './interfaces/asynciterator-pkg.ts';

// Configuration
const ITEM_COUNTS = [100, 1000, 10000];

// Verify correctness before benchmarking
async function verifyCorrectness(): Promise<void> {
  console.log('Verifying correctness...\n');

  const testCount = 1000;

  const count1 = await runAsyncIterable(testCount);
  const checksum1 = getChecksumAsyncIter();

  const count2 = await runWebStreams(testCount);
  const checksum2 = getChecksumWeb();

  const count3 = await runNodeStreams(testCount);
  const checksum3 = getChecksumNode();

  const count4 = await runAsyncIteratorPkg(testCount);
  const checksum4 = getChecksumPkg();

  const count5 = await runNodeStreamsMap(testCount);
  const checksum5 = getChecksumNodeMap();

  console.log('All implementations processed same item count:',
    count1 === count2 && count2 === count3 && count3 === count4 && count4 === count5);
  console.log('All checksums match:',
    checksum1 === checksum2 && checksum2 === checksum3 && checksum3 === checksum4 && checksum4 === checksum5);
  console.log(`  Items: ${count1}, Checksum: ${checksum1}\n`);

  if (checksum1 !== checksum2 || checksum2 !== checksum3 || checksum3 !== checksum4 || checksum4 !== checksum5) {
    throw new Error('Checksum mismatch - implementations differ!');
  }
}

// Run benchmarks
async function main() {
  await verifyCorrectness();

  console.log('Running benchmarks...\n');

  for (const count of ITEM_COUNTS) {
    group(`Stream ${count} items through 3 transforms`, async () => {

      bench('AsyncIterable (native generators)', async () => {
        await runAsyncIterable(count);
      });

      bench('Web Streams (ReadableStream/TransformStream)', async () => {
        await runWebStreams(count);
      });

      bench('Node Streams (readable-stream package)', async () => {
        await runNodeStreams(count);
      });

      bench('Node Streams (readable-stream package, using .map())', async () => {
        await runNodeStreamsMap(count);
      });

      bench('asynciterator package', async () => {
        await runAsyncIteratorPkg(count);
      });

    });
  }

  await run({ colors: false });
}

main().catch(console.error);
