package com.example.ple.domain.event;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

/**
 * InMemoryEventStore — Spring @Repository implementation of EventStore.
 * 
 * Architectural role:
 *   • Implements the append-only log using a ConcurrentHashMap
 *   • Stores events keyed by aggregateId
 *   • Suitable for development, testing, and proof-of-concept phases
 * 
 * Production Note:
 *   • Replace with durable implementations (PostgreSQL, EventStoreDB, etc.)
 *   • Ensure ACID compliance and durability guarantees
 */
@Repository
public class InMemoryEventStore implements EventStore {
    private final ConcurrentHashMap<String, List<DomainEvent>> eventLog = new ConcurrentHashMap<>();

    @Override
    public void save(String aggregateId, List<DomainEvent> events) {
        eventLog.computeIfAbsent(aggregateId, k -> new java.util.concurrent.CopyOnWriteArrayList<>())
                .addAll(events);
    }

    @Override
    public List<DomainEvent> loadAll(String aggregateId) {
        return eventLog.getOrDefault(aggregateId, java.util.Collections.emptyList());
    }

    @Override
    public List<DomainEvent> loadAllEvents() {
        List<DomainEvent> allEvents = new java.util.ArrayList<>();
        eventLog.values().forEach(allEvents::addAll);
        return allEvents;
    }
}
