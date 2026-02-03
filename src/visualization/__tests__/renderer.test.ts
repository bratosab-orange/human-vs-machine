import { describe, it, expect } from 'vitest';
import { renderVisualization } from '../renderer';
import type { ConveyorState } from '../../state/conveyor.state';

describe('renderVisualization', () => {
  it('should render empty positions', () => {
    const state: ConveyorState = {
      length: 3,
      positions: [null, null, null],
      stations: new Map(),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('_ _ _');
  });

  it('should render items on belt', () => {
    const state: ConveyorState = {
      length: 3,
      positions: ['a', null, 'b'],
      stations: new Map(),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('I(a) _ I(b)');
  });

  it('should render empty station', () => {
    const state: ConveyorState = {
      length: 3,
      positions: [null, null, null],
      stations: new Map([[0, { name: 's', size: 1, itemInside: null }]]),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('S(s) _ _');
  });

  it('should render multi-position station', () => {
    const state: ConveyorState = {
      length: 4,
      positions: [null, null, null, null],
      stations: new Map([[0, { name: 's', size: 3, itemInside: null }]]),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('SSS(s) _');
  });

  it('should render station with item inside', () => {
    const state: ConveyorState = {
      length: 3,
      positions: [null, null, null],
      stations: new Map([[0, { name: 's', size: 2, itemInside: 'i' }]]),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('S[I(i)]S(s) _');
  });

  it('should render item stuck to station (just left)', () => {
    const state: ConveyorState = {
      length: 4,
      positions: [null, 'i', null, null],
      stations: new Map([[0, { name: 's', size: 2, itemInside: null }]]),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('SS(s)I(i) _ _');
  });

  it('should render item separated from station after step', () => {
    const state: ConveyorState = {
      length: 4,
      positions: [null, null, 'i', null],
      stations: new Map([[0, { name: 's', size: 2, itemInside: null }]]),
      exitQueue: [],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('SS(s) I(i) _');
  });

  it('should render exit queue', () => {
    const state: ConveyorState = {
      length: 2,
      positions: [null, null],
      stations: new Map(),
      exitQueue: ['b', 'a'],
      isPaused: false,
    };
    
    expect(renderVisualization(state)).toBe('_ _: I(a) I(b)');
  });

  it('should handle multiple stations', () => {
    const state: ConveyorState = {
      length: 5,
      positions: [null, null, null, null, null],
      stations: new Map([
        [0, { name: 's1', size: 1, itemInside: 'i1' }],
        [2, { name: 's2', size: 2, itemInside: null }],
      ]),
      exitQueue: [],
      isPaused: true,
    };
    
    expect(renderVisualization(state)).toBe('S[I(i1)](s1) _ SS(s2) _');
  });
});
