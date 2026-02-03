import type { Event } from '../events/events';
import { projectState } from '../projectors/project-state';
import { renderVisualization } from './renderer';

/**
 * eventsToVisualization : fonction principale de conversion
 * Events → State → Visualization
 * 
 * @param events - Liste d'événements à rejouer
 * @returns Représentation textuelle de l'état du tapis
 */
export function eventsToVisualization(events: Event[]): string {
  const state = projectState(events);
  return renderVisualization(state);
}
