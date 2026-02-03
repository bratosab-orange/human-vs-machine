import { createEmptyState, type ConveyorState } from '../state/conveyor.state';
import type { Event } from '../events/events';
import { applyEvent } from './event-handlers';

/**
 * projectState : rejoue tous les événements pour reconstruire l'état final
 * C'est le cœur du pattern Event Sourcing : l'état est dérivé des événements
 */
export function projectState(events: Event[]): ConveyorState {
  return events.reduce(applyEvent, createEmptyState());
}
