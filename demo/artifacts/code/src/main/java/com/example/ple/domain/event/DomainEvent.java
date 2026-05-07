package com.example.ple.domain.event;

/**
 * DomainEvent — Base interface for all events in the domain.
 * 
 * Architectural role:
 *   • Represents a fact that happened in the domain
 *   • Immutable and event-sourced
 *   • Persisted to the append-only event store
 */
public interface DomainEvent {
    String getAggregateId();
}
