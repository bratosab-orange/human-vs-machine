import { eventsToVisualization } from './index';
import type { Event } from './events/events';

interface TestCase {
  title: string;
  events: Event[];
  expected: string;
}

const tests: TestCase[] = [
  {
    title: 'Test 1: Belt vide size=1',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: { length: 1, stations: [] }
      }
    ],
    expected: '_'
  },
  {
    title: 'Test 2: Belt vide size=3',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] }
      }
    ],
    expected: '_ _ _'
  },
  {
    title: 'Test 3: Item ajouté',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] }
      },
      {
        type: 'ItemAdded',
        item: { name: 'a' }
      }
    ],
    expected: 'I(a) _ _'
  },
  {
    title: 'Test 4: Station size=1',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: {
          length: 3,
          stations: [[0, { name: 's', size: 1 }]]
        }
      }
    ],
    expected: 'S(s) _ _'
  },
  {
    title: 'Test 5: Station size=3',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: {
          length: 3,
          stations: [[0, { name: 's', size: 3 }]]
        }
      }
    ],
    expected: 'SSS(s)'
  },
  {
    title: 'Test 6: Stepping x2',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] }
      },
      {
        type: 'ItemAdded',
        item: { name: 'a' }
      },
      { type: 'Stepped' },
      { type: 'Stepped' }
    ],
    expected: '_ _ I(a)'
  },
  {
    title: 'Test 7: Item exits belt',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] }
      },
      {
        type: 'ItemAdded',
        item: { name: 'a' }
      },
      { type: 'Stepped' },
      { type: 'Stepped' },
      { type: 'Stepped' }
    ],
    expected: '_ _ _: I(a)'
  },
  {
    title: 'Test 8: Multiple items exit',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: { length: 3, stations: [] }
      },
      {
        type: 'ItemAdded',
        item: { name: 'a' }
      },
      { type: 'Stepped' },
      {
        type: 'ItemAdded',
        item: { name: 'b' }
      },
      { type: 'Stepped' },
      { type: 'Stepped' },
      { type: 'Stepped' }
    ],
    expected: '_ _ _: I(b) I(a)'
  },
  {
    title: 'Test 9: Item in station',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: {
          length: 4,
          stations: [[0, { name: 'a', size: 2 }]]
        }
      },
      {
        type: 'ItemAdded',
        item: { name: 'i' }
      },
      {
        type: 'ItemEnteredStation',
        item: { name: 'i' },
        station: { name: 'a', size: 2 }
      },
      { type: 'Paused' }
    ],
    expected: 'S[I(i)]S(a) _ _'
  },
  {
    title: 'Test 10: Item left station (sticky)',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: {
          length: 4,
          stations: [[0, { name: 'a', size: 2 }]]
        }
      },
      {
        type: 'ItemAdded',
        item: { name: 'i' }
      },
      {
        type: 'ItemEnteredStation',
        item: { name: 'i' },
        station: { name: 'a', size: 2 }
      },
      { type: 'Paused' },
      {
        type: 'ItemLeftStation',
        item: { name: 'i' },
        station: { name: 'a', size: 2 }
      },
      { type: 'Resumed' }
    ],
    expected: 'SS(a)I(i) _ _'
  },
  {
    title: 'Test 11: Item left + stepped',
    events: [
      {
        type: 'ConveyorInitialized',
        belt: {
          length: 4,
          stations: [[0, { name: 'a', size: 2 }]]
        }
      },
      {
        type: 'ItemAdded',
        item: { name: 'i' }
      },
      {
        type: 'ItemEnteredStation',
        item: { name: 'i' },
        station: { name: 'a', size: 2 }
      },
      { type: 'Paused' },
      {
        type: 'ItemLeftStation',
        item: { name: 'i' },
        station: { name: 'a', size: 2 }
      },
      { type: 'Resumed' },
      { type: 'Stepped' }
    ],
    expected: 'SS(a) I(i) _'
  }
];

// Run tests and display results
const app = document.getElementById('app')!;

let passCount = 0;
let failCount = 0;

tests.forEach(test => {
  const result = eventsToVisualization(test.events);
  const passed = result === test.expected;
  
  if (passed) passCount++;
  else failCount++;
  
  const testDiv = document.createElement('div');
  testDiv.className = 'test';
  testDiv.innerHTML = `
    <div class="test-title">${test.title} <span class="${passed ? 'pass' : 'fail'}">${passed ? '✓ PASS' : '✗ FAIL'}</span></div>
    <div class="result">Result:   ${result}</div>
    <div class="expected">Expected: ${test.expected}</div>
  `;
  app.appendChild(testDiv);
});

// Summary
const summary = document.createElement('div');
summary.className = 'test';
summary.style.borderLeft = '4px solid #4ec9b0';
summary.innerHTML = `
  <div class="test-title">Summary</div>
  <div class="result">Total: ${tests.length} | <span class="pass">Passed: ${passCount}</span> | <span class="fail">Failed: ${failCount}</span></div>
`;
app.appendChild(summary);

console.log(`\n✅ Phase 2 Complete: ${passCount}/${tests.length} tests passing\n`);
