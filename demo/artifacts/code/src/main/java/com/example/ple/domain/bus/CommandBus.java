package com.example.ple.domain.bus;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import com.example.ple.domain.event.DomainEvent;

/**
 * CommandBus — Routes commands to the appropriate aggregate root.
 * 
 * Architectural role:
 *   • Receives commands from the REST layer
 *   • Dispatches them to aggregate root instances
 *   • Persists payloads as part of event sourcing
 *   • Returns the result of command execution
 */
@Service
public class CommandBus {

  /**
   * Dispatch a command to the aggregate root.
   * 
   * @param aggregateName The name of the target aggregate
   * @param commandName The name of the command being executed
   * @param aggregateId The id of the aggregate
   * @param payload The JSON payload passed from the client
   * @return List of domain events produced by the command
   */
  public List<DomainEvent> dispatch(String aggregateName, String commandName, String aggregateId, Map<String, Object> payload) {
    // Stub implementation: Route command to aggregate and emit a generic event with payload
    return java.util.Collections.singletonList(
      new GenericEvent(aggregateId, aggregateName, commandName, payload)
    );
  }

  /**
   * GenericEvent — Concrete event stub emitted by the command stub.
   * 
   * This is a temporary implementation for development/testing. In a full domain,
   * aggregate-specific event classes would replace this.
   */
  private static class GenericEvent implements DomainEvent {
    private final String aggregateId;
    private final String aggregateName;
    private final String commandName;
    private final Map<String, Object> payload;

    public GenericEvent(String aggregateId, String aggregateName, String commandName, Map<String, Object> payload) {
      this.aggregateId = aggregateId;
      this.aggregateName = aggregateName;
      this.commandName = commandName;
      this.payload = payload != null ? payload : new java.util.HashMap<>();
    }

    @Override
    public String getAggregateId() {
      return aggregateId;
    }

    public String getAggregateName() {
      return aggregateName;
    }

    public String getCommandName() {
      return commandName;
    }

    public Map<String, Object> getPayload() {
      return payload;
    }
  }
}
