import { describe, it, expect } from 'vitest';
import { eventsToVisualization } from '../events-to-visualization';
import type { Event } from '../../events/events';

describe('eventsToVisualization - KATA Examples', () => {
  describe('Basic Belt', () => {
    it('should render empty belt size=1', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 1, stations: [] },
        },
      ];
      
      expect(eventsToVisualization(events)).toBe('_');
    });

    it('should render empty belt size=3', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 3, stations: [] },
        },
      ];
      
      expect(eventsToVisualization(events)).toBe('_ _ _');
    });

    it('should render belt with item', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 3, stations: [] },
        },
        {
          type: 'ItemAdded',
          item: { name: 'a' },
        },
      ];
      
      expect(eventsToVisualization(events)).toBe('I(a) _ _');
    });
  });

  describe('Stations', () => {
    it('should render station size=1', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: {
            length: 3,
            stations: [[0, { name: 's', size: 1 }]],
          },
        },
      ];
      
      expect(eventsToVisualization(events)).toBe('S(s) _ _');
    });

    it('should render station size=3', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: {
            length: 3,
            stations: [[0, { name: 's', size: 3 }]],
          },
        },
      ];
      
      expect(eventsToVisualization(events)).toBe('SSS(s)');
    });
  });

  describe('Stepping', () => {
    it('should render after 2 steps', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 3, stations: [] },
        },
        {
          type: 'ItemAdded',
          item: { name: 'a' },
        },
        { type: 'Stepped' },
        { type: 'Stepped' },
      ];
      
      expect(eventsToVisualization(events)).toBe('_ _ I(a)');
    });

    it('should render item in exit queue', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 3, stations: [] },
        },
        {
          type: 'ItemAdded',
          item: { name: 'a' },
        },
        { type: 'Stepped' },
        { type: 'Stepped' },
        { type: 'Stepped' },
      ];
      
      expect(eventsToVisualization(events)).toBe('_ _ _: I(a)');
    });

    it('should render multiple items in exit queue', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 3, stations: [] },
        },
        {
          type: 'ItemAdded',
          item: { name: 'a' },
        },
        { type: 'Stepped' },
        {
          type: 'ItemAdded',
          item: { name: 'b' },
        },
        { type: 'Stepped' },
        { type: 'Stepped' },
        { type: 'Stepped' },
      ];
      
      expect(eventsToVisualization(events)).toBe('_ _ _: I(b) I(a)');
    });
  });

  describe('Station Processing', () => {
    it('should render item in station', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: {
            length: 4,
            stations: [[0, { name: 'a', size: 2 }]],
          },
        },
        {
          type: 'ItemAdded',
          item: { name: 'i' },
        },
        {
          type: 'ItemEnteredStation',
          item: { name: 'i' },
          station: { name: 'a', size: 2 },
        },
        { type: 'Paused' },
      ];
      
      expect(eventsToVisualization(events)).toBe('S[I(i)]S(a) _ _');
    });

    it('should render item left station (sticky)', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: {
            length: 4,
            stations: [[0, { name: 'a', size: 2 }]],
          },
        },
        {
          type: 'ItemAdded',
          item: { name: 'i' },
        },
        {
          type: 'ItemEnteredStation',
          item: { name: 'i' },
          station: { name: 'a', size: 2 },
        },
        { type: 'Paused' },
        {
          type: 'ItemLeftStation',
          item: { name: 'i' },
          station: { name: 'a', size: 2 },
        },
        { type: 'Resumed' },
      ];
      
      expect(eventsToVisualization(events)).toBe('SS(a)I(i) _ _');
    });

    it('should render item left station + stepped', () => {
      const events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: {
            length: 4,
            stations: [[0, { name: 'a', size: 2 }]],
          },
        },
        {
          type: 'ItemAdded',
          item: { name: 'i' },
        },
        {
          type: 'ItemEnteredStation',
          item: { name: 'i' },
          station: { name: 'a', size: 2 },
        },
        { type: 'Paused' },
        {
          type: 'ItemLeftStation',
          item: { name: 'i' },
          station: { name: 'a', size: 2 },
        },
        { type: 'Resumed' },
        { type: 'Stepped' },
      ];
      
      expect(eventsToVisualization(events)).toBe('SS(a) I(i) _');
    });
  });

  describe('Complex Multi-Station Example', () => {
    it('should handle complex scenario from KATA', () => {
      const station1 = { name: 's1', size: 1 };
      const station2 = { name: 's2', size: 2 };
      const item1 = { name: 'i1' };
      const item2 = { name: 'i2' };

      // Step 1: Initialize
      let events: Event[] = [
        {
          type: 'ConveyorInitialized',
          belt: { length: 4, stations: [[1, station1], [2, station2]] },
        },
      ];
      expect(eventsToVisualization(events)).toBe('_ S(s1) SS(s2)');

      // Step 2: Add item1, step, enter station
      events = [
        ...events,
        { type: 'ItemAdded', item: item1 },
        { type: 'Stepped' },
        { type: 'ItemEnteredStation', item: item1, station: station1 },
        { type: 'Paused' },
      ];
      expect(eventsToVisualization(events)).toBe('_ S[I(i1)](s1) SS(s2)');

      // Step 3: Add item2 during pause
      events = [
        ...events,
        { type: 'ItemAdded', item: item2 },
      ];
      expect(eventsToVisualization(events)).toBe('I(i2) S[I(i1)](s1) SS(s2)');

      // Step 4: Item1 leaves station1
      events = [
        ...events,
        { type: 'ItemLeftStation', item: item1, station: station1 },
        { type: 'Resumed' },
      ];
      expect(eventsToVisualization(events)).toBe('I(i2) S(s1)I(i1) SS(s2)');

      // Step 5: Step, both items enter stations
      events = [
        ...events,
        { type: 'Stepped' },
        { type: 'ItemEnteredStation', item: item2, station: station1 },
        { type: 'ItemEnteredStation', item: item1, station: station2 },
        { type: 'Paused' },
      ];
      expect(eventsToVisualization(events)).toBe('_ S[I(i2)](s1) S[I(i1)]S(s2)');

      // Step 6: Both items leave
      events = [
        ...events,
        { type: 'ItemLeftStation', item: item2, station: station1 },
        { type: 'ItemLeftStation', item: item1, station: station2 },
        { type: 'Resumed' },
      ];
      expect(eventsToVisualization(events)).toBe('_ S(s1)I(i2) SS(s2)I(i1)');

      // Final: All items exit
      events = [
        ...events,
        { type: 'Stepped' },
        { type: 'ItemEnteredStation', item: item2, station: station2 },
        { type: 'Paused' },
        { type: 'ItemLeftStation', item: item2, station: station2 },
        { type: 'Resumed' },
        { type: 'Stepped' },
      ];
      expect(eventsToVisualization(events)).toBe('_ S(s1) SS(s2): I(i2) I(i1)');
    });

    it('should handle complete KATA example with both items exiting', () => {
      const station1 = { name: 's1', size: 1 };
      const station2 = { name: 's2', size: 2 };
      const belt = { length: 4, stations: [[1, station1], [2, station2]] as [number, typeof station1][] };
      const item1 = { name: 'i1' };
      const item2 = { name: 'i2' };

      const events: Event[] = [
        { type: 'ConveyorInitialized', belt },
        { type: 'ItemAdded', item: item1 },
        { type: 'Stepped' },
        { type: 'ItemEnteredStation', item: item1, station: station1 },
        { type: 'Paused' },
        { type: 'ItemAdded', item: item2 },
        { type: 'ItemLeftStation', item: item1, station: station1 },
        { type: 'Resumed' },
        { type: 'Stepped' },
        { type: 'ItemEnteredStation', item: item2, station: station1 },
        { type: 'ItemEnteredStation', item: item1, station: station2 },
        { type: 'Paused' },
        { type: 'ItemLeftStation', item: item2, station: station1 },
        { type: 'ItemLeftStation', item: item1, station: station2 },
        { type: 'Resumed' },
        { type: 'Stepped' },
        { type: 'ItemEnteredStation', item: item2, station: station2 },
        { type: 'Paused' },
        { type: 'ItemLeftStation', item: item2, station: station2 },
        { type: 'Resumed' },
        { type: 'Stepped' },
      ];

      expect(eventsToVisualization(events)).toBe('_ S(s1) SS(s2): I(i2) I(i1)');
    });
  });
});
