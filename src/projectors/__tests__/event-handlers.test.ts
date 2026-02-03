import { describe, it, expect } from 'vitest';
import {
  handleConveyorInitialized,
  handleItemAdded,
  handleStepped,
  handleItemEnteredStation,
  handleItemLeftStation,
  handlePaused,
  handleResumed,
  applyEvent,
} from '../event-handlers';
import { createEmptyState } from '../../state/conveyor.state';
import type { Event } from '../../events/events';

describe('Event Handlers', () => {
  describe('handleConveyorInitialized', () => {
    it('should initialize empty belt', () => {
      const event: Event = {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] },
      };
      const state = handleConveyorInitialized(createEmptyState(), event);
      
      expect(state.length).toBe(3);
      expect(state.positions).toEqual([null, null, null]);
      expect(state.stations.size).toBe(0);
      expect(state.exitQueue).toEqual([]);
      expect(state.isPaused).toBe(false);
    });

    it('should initialize belt with stations', () => {
      const event: Event = {
        type: 'ConveyorInitialized',
        belt: {
          length: 4,
          stations: [[0, { name: 's1', size: 1 }], [2, { name: 's2', size: 2 }]],
        },
      };
      const state = handleConveyorInitialized(createEmptyState(), event);
      
      expect(state.length).toBe(4);
      expect(state.stations.size).toBe(2);
      expect(state.stations.get(0)).toEqual({ name: 's1', size: 1, itemInside: null });
      expect(state.stations.get(2)).toEqual({ name: 's2', size: 2, itemInside: null });
    });
  });

  describe('handleItemAdded', () => {
    it('should add item at position 0', () => {
      const initialState = handleConveyorInitialized(createEmptyState(), {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] },
      });
      
      const event: Event = {
        type: 'ItemAdded',
        item: { name: 'a' },
      };
      const state = handleItemAdded(initialState, event);
      
      expect(state.positions[0]).toBe('a');
      expect(state.positions[1]).toBe(null);
      expect(state.positions[2]).toBe(null);
    });
  });

  describe('handleStepped', () => {
    it('should shift items right', () => {
      let state = handleConveyorInitialized(createEmptyState(), {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] },
      });
      state = handleItemAdded(state, { type: 'ItemAdded', item: { name: 'a' } });
      
      state = handleStepped(state, { type: 'Stepped' });
      
      expect(state.positions).toEqual([null, 'a', null]);
    });

    it('should move item to exit queue when at end', () => {
      let state = handleConveyorInitialized(createEmptyState(), {
        type: 'ConveyorInitialized',
        belt: { length: 2, stations: [] },
      });
      state = handleItemAdded(state, { type: 'ItemAdded', item: { name: 'a' } });
      state = handleStepped(state, { type: 'Stepped' });
      state = handleStepped(state, { type: 'Stepped' });
      
      expect(state.positions).toEqual([null, null]);
      expect(state.exitQueue).toEqual(['a']);
    });

    it('should preserve order in exit queue', () => {
      let state = handleConveyorInitialized(createEmptyState(), {
        type: 'ConveyorInitialized',
        belt: { length: 2, stations: [] },
      });
      state = handleItemAdded(state, { type: 'ItemAdded', item: { name: 'a' } });
      state = handleStepped(state, { type: 'Stepped' });
      state = handleItemAdded(state, { type: 'ItemAdded', item: { name: 'b' } });
      state = handleStepped(state, { type: 'Stepped' });
      state = handleStepped(state, { type: 'Stepped' });
      
      expect(state.exitQueue).toEqual(['a', 'b']);
    });
  });

  describe('handleItemEnteredStation', () => {
    it('should move item from belt to station', () => {
      let state = handleConveyorInitialized(createEmptyState(), {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [[0, { name: 's', size: 1 }]] },
      });
      state = handleItemAdded(state, { type: 'ItemAdded', item: { name: 'i' } });
      
      state = handleItemEnteredStation(state, {
        type: 'ItemEnteredStation',
        item: { name: 'i' },
        station: { name: 's', size: 1 },
      });
      
      expect(state.positions[0]).toBe(null);
      expect(state.stations.get(0)?.itemInside).toBe('i');
    });
  });

  describe('handleItemLeftStation', () => {
    it('should move item from station to belt end position', () => {
      let state = handleConveyorInitialized(createEmptyState(), {
        type: 'ConveyorInitialized',
        belt: { length: 4, stations: [[0, { name: 's', size: 2 }]] },
      });
      state = handleItemAdded(state, { type: 'ItemAdded', item: { name: 'i' } });
      state = handleItemEnteredStation(state, {
        type: 'ItemEnteredStation',
        item: { name: 'i' },
        station: { name: 's', size: 2 },
      });
      
      state = handleItemLeftStation(state, {
        type: 'ItemLeftStation',
        item: { name: 'i' },
        station: { name: 's', size: 2 },
      });
      
      expect(state.stations.get(0)?.itemInside).toBe(null);
      expect(state.positions[1]).toBe('i'); // End of size-2 station at position 0
    });
  });

  describe('handlePaused and handleResumed', () => {
    it('should set isPaused flag', () => {
      let state = createEmptyState();
      state.length = 3;
      
      state = handlePaused(state, { type: 'Paused' });
      expect(state.isPaused).toBe(true);
      
      state = handleResumed(state, { type: 'Resumed' });
      expect(state.isPaused).toBe(false);
    });
  });

  describe('applyEvent', () => {
    it('should dispatch to correct handler', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 2, stations: [] },
        },
        {
          type: 'ItemAdded',
          item: { name: 'a' },
        },
        {
          type: 'Stepped',
        },
      ];
      
      let state = createEmptyState();
      for (const event of events) {
        state = applyEvent(state, event);
      }
      
      expect(state.positions).toEqual([null, 'a']);
    });
  });
});
