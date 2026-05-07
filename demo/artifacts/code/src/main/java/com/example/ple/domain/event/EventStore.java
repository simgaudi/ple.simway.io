package com.example.ple.domain.event;

import java.util.List;

/**
 * EventStore — Interface for the event sourcing vault.
 * 
 * Architectural role:
 *   • Persists domain events to an append-only log
 *   • Reconstructs aggregate state by replaying events
 *   • Provides the source of truth for aggregate state
 */
public interface EventStore {
    void save(String aggregateId, List<DomainEvent> events);
    List<DomainEvent> loadAll(String aggregateId);
    List<DomainEvent> loadAllEvents();
}
