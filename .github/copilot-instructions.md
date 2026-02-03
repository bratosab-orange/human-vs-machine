# Copilot Instructions: Conveyor Belt Event Sourcing Kata

## Project Overview

This is an **event sourcing kata** implementing bidirectional conversion between event streams and visual representations of a conveyor belt system. The core challenge is two functions:
- `eventsToVisualization(Event[]) → string`  
- `visualizationToEvents(string) → Event[]`

Reference [KATA.md](../KATA.md) for complete specifications and examples. [CHECKLIST.md](../CHECKLIST.md) tracks implementation progress.

## Architecture: Event Sourcing Pattern

**State is derived, not stored.** The system reconstructs `ConveyorState` by replaying events through projectors (event handlers). This follows pure event sourcing: events are the source of truth.

### Domain Model ([src/models/](../src/models/))
- `Item` - Objects on the belt (just `name: string`)
- `Station` - Processing zones (`name: string, size: number`)  
- `Belt` - Configuration (`length: number, stations: [position, Station][]`)

### Events ([src/events/events.ts](../src/events/events.ts))
All events are discriminated unions with a `type` field:
- `ConveyorInitialized` - Sets up belt topology
- `ItemAdded` - Places item at position 0
- `Stepped` - Advances belt one position right
- `ItemEnteredStation` / `ItemLeftStation` - Station processing
- `Paused` / `Resumed` - Belt state transitions

### State Management ([src/state/conveyor.state.ts](../src/state/conveyor.state.ts))
`ConveyorState` is the aggregate rebuilt by event projection:
```typescript
{
  length: number,
  positions: (string | null)[],  // Belt positions (null = empty)
  stations: Map<number, StationState>,  // Position → station with itemInside
  exitQueue: string[],  // Items that left the belt
  isPaused: boolean  // Any items in stations?
}
```

**Critical:** State is immutable. Each event handler returns a new state object.

## Domain Rules (from [KATA.md](../KATA.md))

### Stepping Behavior
- `Stepped` shifts all items one position right
- Items at position `length-1` move to `exitQueue`
- Belt cannot step when `isPaused === true`

### Station Mechanics  
- Items enter stations at position 0 (relative to station start)
- Items don't progress through the station, they exit at the station's end position
- When ANY item enters a station: emit `Paused` (transitions from 0 → 1+ items in any station)
- When ALL items leave all stations: emit `Resumed` (transitions from 1+ → 0 items total)
- `Paused`/`Resumed` always immediately follow `ItemEnteredStation`/`ItemLeftStation`

### Visualization Format
- `_` = empty position
- `I(name)` = item  
- `S(name)` = station size 1, `SSS(name)` = station size 3
- `S[I(item)](station)` = item inside station
- `S(station)I(item)` = item just left station (NO SPACE = stuck together)
- `S(station) I(item)` = station and item on different positions (space matters!)
- `: I(a) I(b)` = exit queue (colon separator, rightmost exited first)

### Parsing Order (visualization → events)
- **Left-to-right parsing**: First item seen gets first `ItemAdded`
- Multiple simultaneous station entries: emit left-to-right
- Ambiguity: prefer simpler event sequences

## Development Workflow

### Build & Run
```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # TypeScript compile + production build
```

### TypeScript Configuration
- Target: ES2022, strict mode enabled
- No test framework configured yet - write implementation first
- Entry point: [index.html](../index.html) → `/src/main.ts` (not created yet)

### Current State
**Foundation complete, core logic not implemented:**
- ✅ Type definitions (models, events, state)
- ✅ Barrel exports in [src/index.ts](../src/index.ts)
- ❌ Event handlers (projectors) - **Phase 2 in CHECKLIST**
- ❌ Visualization renderer - **Phase 2.3**
- ❌ Parser (reverse direction) - **Phase 3**
- ❌ UI layer - **Phase 4**

## Code Patterns & Conventions

### Type Discipline
- Use discriminated unions for events (check `event.type`)
- Never mutate state - always return new objects
- Station positions stored as `Map<number, StationState>` for sparse storage

### Event Projection Pattern
```typescript
function applyEvent(state: ConveyorState, event: Event): ConveyorState {
  switch (event.type) {
    case 'ConveyorInitialized': return handleConveyorInitialized(state, event);
    case 'ItemAdded': return handleItemAdded(state, event);
    // ... other handlers
  }
}

function projectState(events: Event[]): ConveyorState {
  return events.reduce(applyEvent, createEmptyState());
}
```

Each handler is a pure function: `(oldState, event) → newState`

### Critical Edge Cases
1. **Station rendering:** `SS[I(x)]S(name)` shows item at position 1 of size-3 station
2. **Sticky items:** `S(a)I(b)` means item `b` just left station `a` (no step yet)
3. **Pause logic:** Only transition when crossing 0↔1+ items threshold across ALL stations
4. **Exit queue order:** Rightmost item exited first (`I(last) I(first)`)

## Key Files to Reference

- [KATA.md](../KATA.md) - Complete specification with examples (311 lines, read fully)
- [CHECKLIST.md](../CHECKLIST.md) - Phased implementation plan (current: Phase 1 done)
- [src/state/conveyor.state.ts](../src/state/conveyor.state.ts) - Aggregate definition
- [src/events/events.ts](../src/events/events.ts) - Event types

## Implementation Tips

When working on **Phase 2** (events → visualization):
- Start with `handleConveyorInitialized` - sets length and stations
- `handleStepped`: shift `positions` array, pop rightmost to `exitQueue`
- `handleItemEnteredStation`: remove from belt, set `stations[pos].itemInside`, set `isPaused`
- Renderer: scan left-to-right, format each position considering station overlays

When working on **Phase 3** (visualization → events):
- Parse tokens: `/_/, /I\([^)]+\)/, /S+\([^)]+\)/, /S+\[I\([^)]+\)\]\([^)]+\)/`
- Build initial `ConveyorInitialized` from station positions
- Emit `ItemAdded` + `Stepped` sequences to place items at their positions
- Detect items in stations → emit enter/pause events
- Detect sticky items → emit leave/resume events

## Workshop Context

This is a 2-hour hands-on lab. Focus on:
1. Implementing the core projection logic (Phase 2)
2. Writing the visualization renderer
3. Parsing visualization back to events (Phase 3)
4. Building simple interactive UI (Phase 4) if time permits

The kata demonstrates event sourcing fundamentals: immutability, event replay, state derivation, and temporal queries.
