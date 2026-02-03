import type { Event } from '../events/events';
import { parseVisualization } from './visualization-parser';

/**
 * visualizationToEvents : convertit une visualization en liste d'événements
 * C'est la direction inverse de eventsToVisualization
 * 
 * Note: La conversion n'est pas entièrement déterministe.
 * On suit la règle du KATA: parsing gauche → droite
 */
export function visualizationToEvents(visualization: string): Event[] {
  const parsed = parseVisualization(visualization);
  const events: Event[] = [];
  
  // 1. ConveyorInitialized
  events.push({
    type: 'ConveyorInitialized',
    belt: {
      length: parsed.beltLength,
      stations: parsed.stations,
    },
  });
  
  // 2. Identifier tous les items et leurs états
  const items: Array<{
    name: string;
    position: number;
    state: 'onBelt' | 'inStation' | 'leftStation' | 'exited';
    stationName?: string;
  }> = [];
  
  let position = 0;
  for (const token of parsed.tokens) {
    if (!token) continue;
    
    switch (token.type) {
      case 'item':
        items.push({ name: token.name, position, state: 'onBelt' });
        position++;
        break;
      case 'station':
        if (token.itemInside) {
          items.push({
            name: token.itemInside,
            position,
            state: 'inStation',
            stationName: token.name,
          });
        }
        position += token.size;
        break;
      case 'itemAfterStation':
        items.push({
          name: token.itemName,
          position,
          state: 'leftStation',
          stationName: token.stationName,
        });
        position++;
        break;
      case 'empty':
        position++;
        break;
    }
  }
  
  // Ajouter les items de la queue de sortie
  for (const itemName of parsed.exitQueue) {
    items.push({ name: itemName, position: parsed.beltLength, state: 'exited' });
  }
  
  // 3. Pour une approche simple: juste ajouter les items dans l'ordre
  // Sans essayer de reconstruire toute la séquence de steps
  // (Une reconstruction complète nécessiterait de simuler l'état)
  
  for (const item of items) {
    events.push({
      type: 'ItemAdded',
      item: { name: item.name },
    });
    
    // Stepped pour atteindre la position
    for (let i = 0; i < item.position; i++) {
      events.push({ type: 'Stepped' });
    }
    
    // Gérer les états spéciaux
    if (item.state === 'inStation' && item.stationName) {
      const station = findStationByName(item.stationName, parsed.stations);
      if (station) {
        events.push({
          type: 'ItemEnteredStation',
          item: { name: item.name },
          station,
        });
        events.push({ type: 'Paused' });
      }
    }
    
    if (item.state === 'leftStation' && item.stationName) {
      const station = findStationByName(item.stationName, parsed.stations);
      if (station) {
        events.push({
          type: 'ItemLeftStation',
          item: { name: item.name },
          station,
        });
        events.push({ type: 'Resumed' });
      }
    }
  }
  
  return events;
}

/**
 * Trouve une station par son nom
 */
function findStationByName(
  name: string,
  stations: [number, { name: string; size: number }][]
): { name: string; size: number } | null {
  for (const [, station] of stations) {
    if (station.name === name) {
      return station;
    }
  }
  return null;
}
