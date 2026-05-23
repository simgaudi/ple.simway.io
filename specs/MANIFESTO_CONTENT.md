# The ple Manifesto: Why "Vibe Coding" is a Dead End (and How We Fix It)

We are building on a fault line. 

The current trajectory of AI-assisted software development—letting general-purpose LLMs iteratively generate, modify, and scaffold raw source code—is a trap. For a weekend hackathon, it’s magic. At enterprise scale, it is a structural disaster. 

We call it "Vibe Coding," and it fundamentally fails because it accelerates the accumulation of **Cognitive Debt**: the crushing burden placed on human developers to read, audit, and maintain fragile, non-deterministic, machine-generated code. When the machine writes code faster than you can read it, verify it, and debug it, the entire system collapses. 

Attempting to fix structural architectural decay by prompting an LLM to patch broken generated code is like trying to fix a crumbling foundation with a paint roller. You cannot fix a deterministic structural collapse with probabilistic mechanisms.

It’s time to stop treating the LLM as a Junior Developer. It’s time to treat it as a **Semantic Mapper**.

Welcome to **Probabilistic-Logical-Execution (`ple`)**.

---

## 1. The Chaos Axiom: Anchoring to the Semantic Ceiling

The industry is desperately trying to force LLMs to behave like deterministic state machines so they can write reliable code. We fundamentally reject this.

**The Chaos Axiom:** *We explicitly reject the pursuit of bit-for-bit deterministic LLMs. True intelligence requires probabilistic flexibility (Chaos).*

Instead of fighting the LLM's chaotic nature, `ple` leverages its absolute theoretical ceiling: **perfect probabilistic semantic translation**. We take the chaotic, informal reality of human thought and flawlessly translate it into a rigid, structured mathematical boundary—the **Abstract Domain Model (ADM)**.

When the LLM outputs the JSON ADM, the probabilistic phase ends. Our deterministic compiler takes over. 

---

## 2. Disposable Code and The True Source of Truth

The software industry operates under the hallucination that the codebase is a static asset. In reality, code is a liability. The true, immutable asset is your **Domain Intent**—the pure business rules and logic. 

With `ple`, the LLM translates your unstructured intent into a rigid ADM JSON schema. Then, a strict deterministic compiler executes this ADM to generate 100% of your application's backend architecture, state machines, and Event Sourced persistence layers.

**The code is treated as disposable exhaust.** If the output is wrong, we fix the intent and regenerate. We never patch the generated code. We eliminate Cognitive Debt by making the code irrelevant to the human.

---

## 3. The Triad of Intent: DDD, BDD, TDD

Historically, Domain-Driven Design (DDD) and Behavior-Driven Development (BDD) failed at scale because of implementation friction. Humans inevitably drift from the Ubiquitous Language when writing mechanical code under deadline pressure. 

`ple` enforces the **Triad of Intent** mathematically:
1. **DDD:** Forms the Ubiquitous Language. If a concept doesn’t exist in your domain model, the compiler refuses to generate it.
2. **BDD:** The executable verification boundary. You define the exact state transitions.
3. **TDD:** The compiler inherently translates your original BDD specifications into executable integration tests directly inside the generated artifact. 

No regex parsers. No manual mapping. The math enforces the architecture.

---

## 4. The Event Sourcing Mandate: Zero-Debt Migrations

Traditional CRUD databases store state in rigid tables, making schema migrations a nightmare. `ple` completely bypasses this.

All `ple`-generated applications default to an **Event Sourcing** architecture. State is calculated deterministically by replaying an append-only log of immutable historical events. 

When your business logic evolves, you don't write complex SQL migrations. You simply update your intent, `ple` compiles a completely new codebase, automatically generates JSON-to-JSON "Upcasters" for legacy events, and replays the ledger. You throw away the old disposable code and instantly rehydrate the new Read Models. **We make traditional database migrations obsolete.**

---

## 5. The Isomorphic Dual Contract (Solving the Headless Paradox)

Because we generate headless backends, how does a non-technical Domain Expert verify the logic without reading code?

`ple` introduces the **Isomorphic Dual Contract**:
1. **The Text Contract (PRD):** A structured English narrative translated *backward* from the mathematical ADM.
2. **The Diagram Contract:** Interactive state charts simulating the event flow.

Because both are generated from the exact same Abstract Syntax Tree (the ADM), they are mathematically guaranteed to be 100% isomorphic. The ambiguity of the text is anchored by the rigid topology of the diagram. When you approve both, you are explicitly approving the underlying math. The PRD *is* the compilation.

---

## 6. Bounded Spouts: Stopping the "Whack-a-Mole" Degradation

When you ask an LLM to iteratively edit a codebase, you get silent corruption across the application. 

To solve this, `ple` uses **Bounded Spouts**. When a user requests an edit, the compiler dynamically slices an isolated sub-graph of the ADM based on semantic relevance. The LLM operates *strictly* within this topological sandbox. If the LLM hallucinates and attempts to mutate state outside this boundary, the compiler instantly rejects the patch. 

You get a Deterministic Diff, allowing you to verify only the surgical changes before the compiler deterministically merges the sub-graph back into the global ADM. 

---

## 7. Data Sovereignty and the Escape Hatch

We are not building a walled garden. The **Application Domain Model (ADM)** is a standalone, framework-agnostic definition of your absolute truth. You physically hold the serialized JSON. You are never locked into a proprietary cloud database or obscured generated code. 

For edge-case mechanical logic (e.g., proprietary cryptographic algorithms), `ple` enforces a strict **Plugin/Extension API (Side-Effect Ports)** architecture. The compiler generates strict interface boundaries, and you write custom adapters that survive regeneration cycles. The ADM governs the State Machine; the escape hatch governs the Turing-Complete mechanics.

---

## The Paradigm Shift

We are changing the paradigm of software development. Humans should not need to learn or review programming languages anymore. Programming languages exist for computers to understand human intent. The machine must learn and adapt to the human, not the other way around.

Stop patching broken machine code. Stop drowning in Cognitive Debt. 

Separate the probability of the LLM from the determinism of the compiler.

Join the shift. 

*(Open-source standard: [ple-adm-schema-v1.json](link-to-json))*
