# Testing with Vitest

This project uses [Vitest](https://vitest.dev/) for unit testing.

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI (requires additional setup)
npm run test:ui
```

## Test Structure

Tests are organized alongside the source code in `__tests__` directories:

```
src/
├── projectors/
│   ├── __tests__/
│   │   ├── event-handlers.test.ts   # Tests for all 7 event handlers
│   │   └── project-state.test.ts    # Tests for event projection
│   ├── event-handlers.ts
│   └── project-state.ts
└── visualization/
    ├── __tests__/
    │   ├── events-to-visualization.test.ts  # Full KATA examples
    │   └── renderer.test.ts                 # Rendering logic tests
    ├── events-to-visualization.ts
    └── renderer.ts
```

## Test Coverage

### Event Handlers (10 tests)
- `handleConveyorInitialized`: Empty belt, belt with stations
- `handleItemAdded`: Adding items at position 0
- `handleStepped`: Shifting items, exit queue management
- `handleItemEnteredStation`: Moving items to stations
- `handleItemLeftStation`: Placing items back on belt
- `handlePaused/handleResumed`: State flag management
- `applyEvent`: Event dispatcher

### Project State (3 tests)
- Event replay to build final state
- Empty event list handling
- Event order significance

### Renderer (9 tests)
- Empty positions
- Items on belt
- Empty stations (single and multi-position)
- Stations with items inside
- Items "stuck" to stations (just left)
- Items separated from stations after step
- Exit queue rendering
- Multiple stations

### Events to Visualization (12 tests)
- All basic KATA examples
- Station processing (entry, exit, sticky behavior)
- Complex multi-station scenario from KATA

## Configuration

Vitest is configured in `vitest.config.ts`:
- Node environment
- Global test APIs (describe, it, expect)
- TypeScript support via ts-node

## Writing New Tests

Follow the existing pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../your-module';

describe('YourModule', () => {
  it('should do something', () => {
    const result = yourFunction(input);
    expect(result).toBe(expected);
  });
});
```

## Test Philosophy

Tests focus on:
1. **Event sourcing principles**: Immutability, event order, state derivation
2. **KATA compliance**: All examples from KATA.md must pass
3. **Edge cases**: Empty states, boundary conditions, complex scenarios
4. **Pure functions**: No side effects, deterministic outputs
