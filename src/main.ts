import {
  eventsToVisualization,
  visualizationToEvents,
  projectState,
  type Event,
  type Station,
} from './index';

// ==========================================
// Global State
// ==========================================
let events: Event[] = [];
let parsedEventsCache: Event[] | null = null;

// ==========================================
// UI Update Functions
// ==========================================

function updateVisualization() {
  const viz = eventsToVisualization(events);
  const vizElement = document.getElementById('visualization')!;
  vizElement.textContent = viz;

  // Update status
  const state = projectState(events);
  const statusElement = document.getElementById('status')!;
  
  if (state.isPaused) {
    statusElement.textContent = 'Paused';
    statusElement.className = 'status paused';
    vizElement.classList.add('paused');
  } else {
    statusElement.textContent = 'Running';
    statusElement.className = 'status running';
    vizElement.classList.remove('paused');
  }

  // Update step button
  const stepBtn = document.getElementById('stepBtn') as HTMLButtonElement;
  stepBtn.disabled = state.isPaused;
}

function updateEventsList() {
  const eventsElement = document.getElementById('events')!;
  
  if (events.length === 0) {
    eventsElement.innerHTML = '<div class="event-item">No events yet. Initialize the belt to start!</div>';
    return;
  }

  eventsElement.innerHTML = events
    .map((event, index) => {
      const eventStr = formatEvent(event);
      return `<div class="event-item">${index + 1}. ${eventStr}</div>`;
    })
    .join('');

  // Scroll to bottom
  eventsElement.scrollTop = eventsElement.scrollHeight;
}

function formatEvent(event: Event): string {
  switch (event.type) {
    case 'ConveyorInitialized':
      return `ConveyorInitialized(length=${event.belt.length}, stations=${event.belt.stations.length})`;
    case 'ItemAdded':
      return `ItemAdded(item="${event.item.name}")`;
    case 'Stepped':
      return 'Stepped';
    case 'ItemEnteredStation':
      return `ItemEnteredStation(item="${event.item.name}", station="${event.station.name}")`;
    case 'ItemLeftStation':
      return `ItemLeftStation(item="${event.item.name}", station="${event.station.name}")`;
    case 'Paused':
      return 'Paused';
    case 'Resumed':
      return 'Resumed';
    default:
      return JSON.stringify(event);
  }
}

// ==========================================
// Event Emission Helper
// ==========================================

function emitEvent(event: Event) {
  events.push(event);
  updateVisualization();
  updateEventsList();
}

function emitEvents(newEvents: Event[]) {
  events.push(...newEvents);
  updateVisualization();
  updateEventsList();
}

// ==========================================
// Control Functions (exposed to window)
// ==========================================

(window as any).initializeBelt = function() {
  const length = parseInt((document.getElementById('beltLength') as HTMLInputElement).value);
  
  if (isNaN(length) || length < 1) {
    alert('Please enter a valid belt length (≥ 1)');
    return;
  }

  // Collect stations
  const stations: [number, Station][] = [];
  const stationItems = document.querySelectorAll('#stationList .station-item');
  
  stationItems.forEach((item) => {
    const pos = parseInt((item.querySelector('.station-pos') as HTMLInputElement).value);
    const name = (item.querySelector('.station-name') as HTMLInputElement).value.trim();
    const size = parseInt((item.querySelector('.station-size') as HTMLInputElement).value);

    if (!isNaN(pos) && name && !isNaN(size) && size > 0) {
      stations.push([pos, { name, size }]);
    }
  });

  // Sort stations by position
  stations.sort((a, b) => a[0] - b[0]);

  // Reset and initialize
  events = [];
  emitEvent({
    type: 'ConveyorInitialized',
    belt: { length, stations },
  });
};

(window as any).addItem = function() {
  if (events.length === 0) {
    alert('Please initialize the belt first!');
    return;
  }

  const itemName = (document.getElementById('itemName') as HTMLInputElement).value.trim();
  
  if (!itemName) {
    alert('Please enter an item name');
    return;
  }

  const state = projectState(events);
  
  if (state.isPaused) {
    // Can add items while paused
    emitEvent({
      type: 'ItemAdded',
      item: { name: itemName },
    });
  } else {
    emitEvent({
      type: 'ItemAdded',
      item: { name: itemName },
    });
  }

  // Auto-check for station entry at position 0
  checkForStationEntry();
};

(window as any).step = function() {
  if (events.length === 0) {
    alert('Please initialize the belt first!');
    return;
  }

  const state = projectState(events);
  
  if (state.isPaused) {
    alert('Cannot step while belt is paused (items in station). Items will auto-exit.');
    return;
  }

  emitEvent({ type: 'Stepped' });
  
  // Auto-check for station entries and exits
  checkForStationEntry();
};

(window as any).reset = function() {
  if (confirm('Reset all events and start fresh?')) {
    events = [];
    parsedEventsCache = null;
    updateVisualization();
    updateEventsList();
    document.getElementById('parsedEvents')!.style.display = 'none';
  }
};

(window as any).addStation = function() {
  const stationList = document.getElementById('stationList')!;
  const newItem = document.createElement('div');
  newItem.className = 'station-item';
  newItem.innerHTML = `
    <input type="number" placeholder="Position" value="0" min="0" class="station-pos" />
    <input type="text" placeholder="Station Name" value="s" class="station-name" />
    <input type="number" placeholder="Size" value="1" min="1" class="station-size" />
    <button type="button" class="btn-danger" onclick="removeStation(this)">×</button>
  `;
  stationList.appendChild(newItem);
};

(window as any).removeStation = function(button: HTMLButtonElement) {
  const stationList = document.getElementById('stationList')!;
  if (stationList.children.length > 1) {
    button.closest('.station-item')?.remove();
  } else {
    alert('At least one station configuration must remain');
  }
};

// ==========================================
// Reverse Mode Functions
// ==========================================

(window as any).parseVisualization = function() {
  const input = (document.getElementById('reverseInput') as HTMLTextAreaElement).value.trim();
  
  if (!input) {
    alert('Please enter a visualization to parse');
    return;
  }

  try {
    parsedEventsCache = visualizationToEvents(input);
    
    // Display parsed events
    const parsedEventsDiv = document.getElementById('parsedEvents')!;
    const parsedEventsList = document.getElementById('parsedEventsList')!;
    
    parsedEventsList.innerHTML = parsedEventsCache
      .map((event, index) => `${index + 1}. ${formatEvent(event)}`)
      .join('<br>');
    
    parsedEventsDiv.style.display = 'block';
  } catch (error) {
    alert(`Failed to parse visualization: ${error}`);
    console.error(error);
  }
};

(window as any).loadParsedEvents = function() {
  if (!parsedEventsCache || parsedEventsCache.length === 0) {
    alert('Please parse a visualization first!');
    return;
  }

  if (events.length > 0) {
    if (!confirm('This will replace current events. Continue?')) {
      return;
    }
  }

  events = [...parsedEventsCache];
  updateVisualization();
  updateEventsList();
};

// ==========================================
// Auto Station Entry/Exit Detection
// ==========================================

function checkForStationEntry() {
  const state = projectState(events);
  
  // Check each station position
  for (const [pos, stationState] of state.stations.entries()) {
    // If station is empty and there's an item at that position
    if (!stationState.itemInside && state.positions[pos]) {
      const itemName = state.positions[pos]!;
      
      // Item enters station
      emitEvent({
        type: 'ItemEnteredStation',
        item: { name: itemName },
        station: { name: stationState.name, size: stationState.size },
      });
      
      // Check if we need to emit Paused
      const newState = projectState(events);
      if (newState.isPaused) {
        // Paused is auto-emitted by handler
      }
      
      // Simulate processing - items leave station after a delay
      setTimeout(() => {
        autoExitStation(itemName, stationState.name, stationState.size);
      }, 2000); // 2 second processing time
      
      return; // Only process one at a time
    }
  }
}

function autoExitStation(itemName: string, stationName: string, stationSize: number) {
  const state = projectState(events);
  
  // Find the station with this item
  for (const [, stationState] of state.stations.entries()) {
    if (stationState.name === stationName && stationState.itemInside === itemName) {
      emitEvent({
        type: 'ItemLeftStation',
        item: { name: itemName },
        station: { name: stationName, size: stationSize },
      });
      
      // Check if we need to emit Resumed
      const newState = projectState(events);
      if (!newState.isPaused) {
        // Resumed is auto-emitted by handler
      }
      
      // Check for next station entry
      setTimeout(() => checkForStationEntry(), 100);
      return;
    }
  }
}

// ==========================================
// Initialize on Load
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  // Initialize with default belt
  (window as any).initializeBelt();
});