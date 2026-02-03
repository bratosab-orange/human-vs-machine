import type { ConveyorState } from '../state/conveyor.state';
import type {
  ConveyorInitialized,
  ItemAdded,
  ItemEnteredStation,
  ItemLeftStation,
  Stepped,
  Paused,
  Resumed,
  Event,
} from '../events/events';

/**
 * handleConveyorInitialized : initialise l'état du tapis
 */
export function handleConveyorInitialized(
  _state: ConveyorState,
  event: ConveyorInitialized
): ConveyorState {
  const { belt } = event;
  
  // Créer les positions vides
  const positions = Array(belt.length).fill(null);
  
  // Créer la map des stations
  const stations = new Map();
  for (const [position, station] of belt.stations) {
    stations.set(position, {
      name: station.name,
      size: station.size,
      itemInside: null,
    });
  }
  
  return {
    length: belt.length,
    positions,
    stations,
    exitQueue: [],
    isPaused: false,
  };
}

/**
 * handleItemAdded : ajoute un item en position 0
 */
export function handleItemAdded(
  state: ConveyorState,
  event: ItemAdded
): ConveyorState {
  const newPositions = [...state.positions];
  newPositions[0] = event.item.name;
  
  return {
    ...state,
    positions: newPositions,
  };
}

/**
 * handleStepped : décale tous les items d'une position vers la droite
 */
export function handleStepped(
  state: ConveyorState,
  _event: Stepped
): ConveyorState {
  const newPositions = Array(state.length).fill(null);
  const newExitQueue = [...state.exitQueue];
  
  // Décaler chaque item d'une position vers la droite
  for (let i = 0; i < state.positions.length; i++) {
    const item = state.positions[i];
    if (item !== null) {
      if (i === state.length - 1) {
        // L'item sort du tapis
        newExitQueue.push(item);
      } else {
        // L'item avance d'une position
        newPositions[i + 1] = item;
      }
    }
  }
  
  return {
    ...state,
    positions: newPositions,
    exitQueue: newExitQueue,
  };
}

/**
 * handleItemEnteredStation : un item entre dans une station
 * L'item est retiré du tapis et placé dans la station
 */
export function handleItemEnteredStation(
  state: ConveyorState,
  event: ItemEnteredStation
): ConveyorState {
  const { item, station } = event;
  
  // Trouver la position de la station
  let stationPosition = -1;
  for (const [pos, st] of state.stations.entries()) {
    if (st.name === station.name && st.size === station.size) {
      stationPosition = pos;
      break;
    }
  }
  
  if (stationPosition === -1) {
    throw new Error(`Station ${station.name} not found`);
  }
  
  // Retirer l'item du tapis (il doit être à la position de la station)
  const newPositions = [...state.positions];
  newPositions[stationPosition] = null;
  
  // Mettre l'item dans la station
  const newStations = new Map(state.stations);
  const stationState = newStations.get(stationPosition)!;
  newStations.set(stationPosition, {
    ...stationState,
    itemInside: item.name,
  });
  
  return {
    ...state,
    positions: newPositions,
    stations: newStations,
  };
}

/**
 * handleItemLeftStation : un item quitte une station
 * L'item est remis sur le tapis à la fin de la station
 */
export function handleItemLeftStation(
  state: ConveyorState,
  event: ItemLeftStation
): ConveyorState {
  const { item, station } = event;
  
  // Trouver la position de la station
  let stationPosition = -1;
  for (const [pos, st] of state.stations.entries()) {
    if (st.name === station.name && st.size === station.size) {
      stationPosition = pos;
      break;
    }
  }
  
  if (stationPosition === -1) {
    throw new Error(`Station ${station.name} not found`);
  }
  
  // Retirer l'item de la station
  const newStations = new Map(state.stations);
  const stationState = newStations.get(stationPosition)!;
  newStations.set(stationPosition, {
    ...stationState,
    itemInside: null,
  });
  
  // Placer l'item à la fin de la station (position + size - 1)
  const itemPosition = stationPosition + stationState.size - 1;
  const newPositions = [...state.positions];
  newPositions[itemPosition] = item.name;
  
  return {
    ...state,
    positions: newPositions,
    stations: newStations,
  };
}

/**
 * handlePaused : le tapis est mis en pause
 */
export function handlePaused(
  state: ConveyorState,
  _event: Paused
): ConveyorState {
  return {
    ...state,
    isPaused: true,
  };
}

/**
 * handleResumed : le tapis reprend
 */
export function handleResumed(
  state: ConveyorState,
  _event: Resumed
): ConveyorState {
  return {
    ...state,
    isPaused: false,
  };
}

/**
 * applyEvent : applique un événement à un état et retourne le nouvel état
 */
export function applyEvent(state: ConveyorState, event: Event): ConveyorState {
  switch (event.type) {
    case 'ConveyorInitialized':
      return handleConveyorInitialized(state, event);
    case 'ItemAdded':
      return handleItemAdded(state, event);
    case 'Stepped':
      return handleStepped(state, event);
    case 'ItemEnteredStation':
      return handleItemEnteredStation(state, event);
    case 'ItemLeftStation':
      return handleItemLeftStation(state, event);
    case 'Paused':
      return handlePaused(state, event);
    case 'Resumed':
      return handleResumed(state, event);
    default:
      return state;
  }
}
