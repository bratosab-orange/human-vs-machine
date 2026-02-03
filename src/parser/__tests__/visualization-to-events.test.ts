import { describe, it, expect } from 'vitest';
import { visualizationToEvents } from '../visualization-to-events';
import { eventsToVisualization } from '../../visualization/events-to-visualization';

describe('visualizationToEvents', () => {
  describe('Basic cases', () => {
    it('should parse empty belt', () => {
      const viz = '_';
      const events = visualizationToEvents(viz);
      
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual({
        type: 'ConveyorInitialized',
        belt: { length: 1, stations: [] },
      });
    });

    it('should parse empty belt size 3', () => {
      const viz = '_ _ _';
      const events = visualizationToEvents(viz);
      
      expect(events[0]).toEqual({
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] },
      });
    });

    it('should parse belt with item at position 0', () => {
      const viz = 'I(a) _ _';
      const events = visualizationToEvents(viz);
      
      expect(events).toContainEqual({
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] },
      });
      expect(events).toContainEqual({
        type: 'ItemAdded',
        item: { name: 'a' },
      });
    });

    it('should parse belt with item at position 2', () => {
      const viz = '_ _ I(a)';
      const events = visualizationToEvents(viz);
      
      expect(events).toContainEqual({
        type: 'ItemAdded',
        item: { name: 'a' },
      });
      // Should have 2 Stepped events to move item to position 2
      const steppedCount = events.filter(e => e.type === 'Stepped').length;
      expect(steppedCount).toBe(2);
    });
  });

  describe('Stations', () => {
    it('should parse empty station', () => {
      const viz = 'S(s) _ _';
      const events = visualizationToEvents(viz);
      
      expect(events[0]).toEqual({
        type: 'ConveyorInitialized',
        belt: {
          length: 3,
          stations: [[0, { name: 's', size: 1 }]],
        },
      });
    });

    it('should parse multi-position station', () => {
      const viz = 'SSS(s)';
      const events = visualizationToEvents(viz);
      
      expect(events[0]).toEqual({
        type: 'ConveyorInitialized',
        belt: {
          length: 3,
          stations: [[0, { name: 's', size: 3 }]],
        },
      });
    });
  });

  describe('Exit queue', () => {
    it('should parse exit queue with one item', () => {
      const viz = '_ _ _: I(a)';
      const events = visualizationToEvents(viz);
      
      expect(events).toContainEqual({
        type: 'ItemAdded',
        item: { name: 'a' },
      });
      // Item should be stepped to position 3 (off the belt)
      const steppedCount = events.filter(e => e.type === 'Stepped').length;
      expect(steppedCount).toBe(3);
    });

    it('should parse exit queue with multiple items', () => {
      const viz = '_ _ _: I(b) I(a)';
      const events = visualizationToEvents(viz);
      
      // Should have both items added
      const itemAdded = events.filter(e => e.type === 'ItemAdded');
      expect(itemAdded).toHaveLength(2);
      expect(itemAdded.map(e => e.item.name)).toContain('a');
      expect(itemAdded.map(e => e.item.name)).toContain('b');
    });
  });

  describe('Round-trip tests', () => {
    it('should round-trip: empty belt', () => {
      const original = '_';
      const events = visualizationToEvents(original);
      const reconstructed = eventsToVisualization(events);
      
      expect(reconstructed).toBe(original);
    });

    it('should round-trip: belt with item', () => {
      const original = 'I(a) _ _';
      const events = visualizationToEvents(original);
      const reconstructed = eventsToVisualization(events);
      
      expect(reconstructed).toBe(original);
    });

    it('should round-trip: empty station', () => {
      const original = 'S(s) _ _';
      const events = visualizationToEvents(original);
      const reconstructed = eventsToVisualization(events);
      
      expect(reconstructed).toBe(original);
    });

    it('should round-trip: multi-position station', () => {
      const original = 'SSS(s)';
      const events = visualizationToEvents(original);
      const reconstructed = eventsToVisualization(events);
      
      expect(reconstructed).toBe(original);
    });

    it('should round-trip: exit queue', () => {
      const original = '_ _ _: I(a)';
      const events = visualizationToEvents(original);
      const reconstructed = eventsToVisualization(events);
      
      expect(reconstructed).toBe(original);
    });
  });
});
