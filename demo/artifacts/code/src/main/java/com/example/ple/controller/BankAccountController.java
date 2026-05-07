package com.example.ple.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.example.ple.domain.bus.CommandBus;
import com.example.ple.domain.event.EventStore;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.example.ple.domain.event.DomainEvent;

@RestController
@RequestMapping("/api/bankaccount")
public class BankAccountController {

  private final CommandBus commandBus;
  private final EventStore eventStore;

  @Autowired
  public BankAccountController(CommandBus commandBus, EventStore eventStore) {
    this.commandBus = commandBus;
    this.eventStore = eventStore;
  }

    @PostMapping("/{id}/deposit")
    public Map<String, Object> deposit(@PathVariable String id, @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> actualPayload = payload != null ? payload : new java.util.HashMap<>();
        List<DomainEvent> events = commandBus.dispatch("BankAccount", "Deposit", id, actualPayload);
        eventStore.save(id, events);
        return projectState(id, events);
    }

    @PostMapping("/{id}/withdrawal")
    public Map<String, Object> withdrawal(@PathVariable String id, @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> actualPayload = payload != null ? payload : new java.util.HashMap<>();
        List<DomainEvent> events = commandBus.dispatch("BankAccount", "Withdrawal", id, actualPayload);
        eventStore.save(id, events);
        return projectState(id, events);
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        List<DomainEvent> allEvents = eventStore.loadAllEvents();
        return allEvents.stream()
            .collect(java.util.stream.Collectors.groupingBy(DomainEvent::getAggregateId))
            .entrySet().stream()
            .map(entry -> projectState(entry.getKey(), entry.getValue()))
            .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        List<DomainEvent> events = eventStore.loadAll(id);
        if (events.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "AggregateNotFound");
            error.put("aggregateType", "BankAccount");
            error.put("id", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } else {
            return ResponseEntity.ok(projectState(id, events));
        }
    }

  /**
   * Project event stream into current state (Read Model).
   * 
   * Folds the event history for a given aggregate into a single Map representing
   * the current state by applying deterministic state reducers based on command
   * operations (SET, ADD, SUBTRACT) rather than blind payload merging.
   * 
   * @param id The aggregate ID
   * @param events The event stream for this aggregate
   * @return A Map<String, Object> representing the current state
   */
  private Map<String, Object> projectState(String id, List<DomainEvent> events) {
    Map<String, Object> state = new HashMap<>();
    state.put("aggregateId", id);
    
    state.put("accountNumber", null);
    state.put("currency", null);
    state.put("balance", null);

    for (DomainEvent event : events) {
      // Check if this is a GenericEvent with a payload (using reflection-safe approach)
      try {
        // Try to get the payload if it exists
        var payloadMethod = event.getClass().getDeclaredMethod("getPayload");
        payloadMethod.setAccessible(true);
        Map<String, Object> payload = (Map<String, Object>) payloadMethod.invoke(event);
        if (payload != null) {
          // Get command name from event
          var cmdNameMethod = event.getClass().getDeclaredMethod("getCommandName");
          cmdNameMethod.setAccessible(true);
          String commandName = (String) cmdNameMethod.invoke(event);
          
          switch (commandName) {
          case "Deposit":

          state.put("balance", (Double) state.getOrDefault("balance", 0.0) + (Double) payload.get("amount"));
            break;
          case "Withdrawal":

          state.put("balance", (Double) state.getOrDefault("balance", 0.0) - (Double) payload.get("amount"));
            break;
          default:
            // Unknown command, skip state update
            break;
        }
        }
      } catch (Exception e) {
        // Event doesn't have a payload, skip it
      }
    }
    
    return state;
  }
}
