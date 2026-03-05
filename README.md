# bench-streams

*A collaboration between [Jacopo](https://treesandrobots.com) and [Sage](https://treesandrobots.com/2026/03/sage-the-harmonic-selector.html).*

Benchmark streaming interfaces across JavaScript runtimes for CPU-bound transformation chains.
## Interfaces Tested

1. **AsyncIterable** (native async generators) - ES2022 standard
2. **Web Streams** (ReadableStream/TransformStream) - Web standard
3. **Node Streams** (readable-stream package) - Node.js streaming API, cross-runtime compatible
4. **asynciterator** - Event-based pull streaming from npm

## Quick Start

```bash
npm install
```bash
npm install
npm run typecheck  # Type check only
npm run bench      # Run benchmarks (Node 24+ required for native TS stripping)
```
## Project Structure

```
src/
  transform.ts              # Shared transformation logic with checksum side effects
  bench.ts                  # Main benchmark entry point
  interfaces/
    async-iterable.ts       # Native async generators
    web-streams.ts          # Web Streams API
    node-streams.ts         # Node Streams via readable-stream
    asynciterator-pkg.ts    # asynciterator npm package
```

## Design Decisions

### Anti-Optimization Strategy
Each transformation updates a global checksum using modulo arithmetic with a large prime. This ensures:
- Code cannot be optimized away or JIT'ed out
- Results are verifiable across implementations
- Minimal but observable side effects

### Transformations
Three simple numeric transformations with different operation profiles:
- `transform1`: doubling with checksum
- `transform2`: square root with checksum  
- `transform3`: trigonometric with checksum

### Benchmark Design
Each run creates a source of N items, chains 3 transforms, and consumes results. This isolates streaming overhead from transformation cost.

## Initial Results (Node v24.11.1, ARM64 Linux)

| Interface | 100 items | 1000 items | 10000 items |
|-----------|-----------|------------|-------------|
| asynciterator | 18µs | 110µs | 1.0ms |
| Node Streams | 80µs | 571µs | 5.5ms |
| AsyncIterable | 54µs | 523µs | 5.7ms |
| Web Streams | 770µs | 6.9ms | 71.8ms |

**Key findings:**
- `asynciterator` package is consistently fastest (3-5x vs native generators)
- Web Streams have ~40-70x overhead compared to asynciterator
- Node Streams and native generators have similar performance profiles

## Cross-Runtime Testing

Test with Deno:
```bash
deno run --allow-all src/bench.ts
```

Test with Bun:
```bash
bun run src/bench.ts
```

Note: May require adjusting imports for Deno/Bun module resolution.

## Dependencies

Minimal dependencies:
- `mitata` - benchmarking library
- `readable-stream` - Node Streams polyfill for cross-runtime use
- `asynciterator` - async iterator package
- `typescript` - development only
