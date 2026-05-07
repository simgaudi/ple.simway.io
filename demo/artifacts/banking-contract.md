# Domain: RetailBanking

## Architecture Overview

```mermaid
graph TD
    classDef command fill:#2563eb,stroke:#1d4ed8,color:#fff,rx:5px,ry:5px;
    classDef event fill:#16a34a,stroke:#15803d,color:#fff,rx:5px,ry:5px;
    classDef rule fill:#f59e0b,stroke:#b45309,color:#fff,shape:hexagon;
    classDef rejected fill:#dc2626,stroke:#991b1b,color:#fff;
    classDef classBox fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff,font-family:Arial;

    subgraph BankAccount [Aggregate: BankAccount]
        Ent_BankAccount["<b>Account</b><br/>---<br/>accountNumber: String<br/>currency: String<br/>balance: Decimal<br/>"]:::classBox
        C_BankAccount_Deposit["<b>Deposit</b><br/>---<br/>amount: Decimal<br/>"]:::command
        Ent_BankAccount -->|executes| C_BankAccount_Deposit
        C_BankAccount_Withdrawal["<b>Withdrawal</b><br/>---<br/>amount: Decimal<br/>"]:::command
        Ent_BankAccount -->|executes| C_BankAccount_Withdrawal
        R_BankAccount_0{{Rule: balance cannot go below zero unless OverdraftFacility is active}}:::rule
        E_BankAccount_DepositCompleted["<b>DepositCompleted</b><br/>---<br/>amount: Decimal<br/>"]:::event
        C_BankAccount_Deposit -->|emits| E_BankAccount_DepositCompleted
        E_BankAccount_FundsWithdrawn["<b>FundsWithdrawn</b><br/>---<br/>amount: Decimal<br/>"]:::event
        C_BankAccount_Withdrawal -->|emits| E_BankAccount_FundsWithdrawn
    end

```

## Aggregate: BankAccount

### Structural View (Class Diagram)

```mermaid
classDiagram
    direction TD
    class Account {
        String accountNumber
        String currency
        Decimal balance
    }
```

### Behavioral View (State Diagram)

```mermaid
stateDiagram-v2
    direction TD
    [*] --> Active
    Active --> Active : Deposit(amount#colon; Decimal)<br>balance += amount
    Active --> Active : Withdrawal(amount#colon; Decimal)<br>balance -= amount
    Active --> [*] : emits DepositCompleted
    Active --> [*] : emits FundsWithdrawn
```

### Visual Contract

#### Invariants
- **[Account]** balance cannot go below zero unless OverdraftFacility is active

#### Commands
- **Deposit** (stateless - no state change) — Actor: Customer — Params: (amount: Decimal)
- **Withdrawal** (stateless - no state change) — Actor: Customer — Params: (amount: Decimal)

#### Domain Events
- **DepositCompleted** (triggered by: Deposit) — Payload: (amount: Decimal)
- **FundsWithdrawn** (triggered by: Withdrawal) — Payload: (amount: Decimal)

---

