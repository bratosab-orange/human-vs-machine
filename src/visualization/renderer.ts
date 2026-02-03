import type { ConveyorState, StationState } from '../state/conveyor.state';

/**
 * renderVisualization : convertit l'état en représentation textuelle
 */
export function renderVisualization(state: ConveyorState): string {
  const parts: string[] = [];
  let skipUntil = -1; // Skip positions occupied by multi-position stations
  
  // Parcourir chaque position du tapis
  for (let i = 0; i < state.length; i++) {
    if (i < skipUntil) {
      continue; // Skip positions inside multi-position stations
    }
    
    const station = findStationAtPosition(i, state);
    if (station && station.stationStart === i) {
      // Render the entire station at its start position
      // Check if there's an item at the station's END position (last position of station)
      const stationEndPos = station.stationStart + station.stationState.size - 1;
      const itemAtEnd = state.positions[stationEndPos];
      parts.push(renderStation(station.stationState, itemAtEnd));
      skipUntil = station.stationStart + station.stationState.size;
    } else if (!station) {
      // Regular position (not part of a station)
      const item = state.positions[i];
      parts.push(item ? `I(${item})` : '_');
    }
  }
  
  // Construire la représentation du tapis
  let result = parts.join(' ');

  // Ajouter la queue de sortie si elle n'est pas vide
  if (state.exitQueue.length > 0) {
    // Les items sont affichés dans l'ordre inverse (dernier sorti en premier)
    const reversedQueue = [...state.exitQueue].reverse();
    const exitPart = ':' + reversedQueue.map(item => ` I(${item})`).join('');
    result += exitPart;
  }
  
  return result;
}



/**
 * renderStation : rend une station avec son contenu éventuel
 */
function renderStation(station: StationState, itemAtPosition: string | null): string {
  // Cas 1: Item dans la station
  if (station.itemInside) {
    // L'item est toujours à la position 0 (entrée) de la station
    // Format: 1 S avant le bracket, puis [I(item)], puis les S restants, puis (name)
    // size=1: S[I(item)](name) - 1 S avant, 0 S après
    // size=2: S[I(item)]S(name) - 1 S avant, 1 S après
    // size=3: S[I(item)]SS(name) - 1 S avant, 2 S après
    const sBefore = 'S';
    const sAfter = 'S'.repeat(Math.max(0, station.size - 1));
    return `${sBefore}[I(${station.itemInside})]${sAfter}(${station.name})`;
  }
  
  // Cas 2: Item collé (vient de sortir de la station)
  const stationChars = 'S'.repeat(station.size);
  if (itemAtPosition) {
    return `${stationChars}(${station.name})I(${itemAtPosition})`;
  }
  
  // Cas 3: Station vide
  return `${stationChars}(${station.name})`;
}

/**
 * findStationAtPosition : trouve la station qui occupe une position donnée
 */
function findStationAtPosition(
  position: number,
  state: ConveyorState
): { stationState: StationState; stationStart: number } | null {
  for (const [stationStart, stationState] of state.stations.entries()) {
    const stationEnd = stationStart + stationState.size - 1;
    if (position >= stationStart && position <= stationEnd) {
      return { stationState, stationStart };
    }
  }
  return null;
}
