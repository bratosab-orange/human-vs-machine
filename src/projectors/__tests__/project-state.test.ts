import { describe, it, expect } from 'vitest';
import { projectState } from '../project-state';
import type { Event } from '../../events/events';

describe('projectState', () => {
  it('should replay events to build final state', () => {
    const events: Event[] = [
      {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] },
      },
      {
        type: 'ItemAdded',
        item: { name: 'a' },
      },
      {
        type: 'Stepped',
      },
      {
        type: 'ItemAdded',
        item: { name: 'b' },
      },
    ];
    
    const state = projectState(events);
    
    expect(state.length).toBe(3);
    expect(state.positions).toEqual(['b', 'a', null]);
  });

  it('should handle empty event list', () => {
    const state = projectState([]);
    
    expect(state.length).toBe(0);
    expect(state.positions).toEqual([]);
    expect(state.exitQueue).toEqual([]);
  });

  it('should maintain event order significance', () => {
    const events: Event[] = [
      {
        type: 'ConveyorInitialized',
        belt: { length: 2, stations: [] },
      },
      {
        type: 'ItemAdded',
        item: { name: 'first' },
      },
      {
        type: 'Stepped',
      },
      {
        type: 'ItemAdded',
        item: { name: 'second' },
      },
      {
        type: 'Stepped',
      },
      {
        type: 'Stepped',
      },
    ];
    
    const state = projectState(events);
    
    expect(state.exitQueue).toEqual(['first', 'second']);
  });
});
