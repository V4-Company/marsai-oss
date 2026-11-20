# Cross-service flow prototype

A single HTML file in which each service is an actor, each event is a message, and whoever clicks decides what happens to each message: deliver, deliver again, hold or drop. Use it when the question is about **what happens between the services when delivery is not perfect**.

It is the kind of defect that does not show up in a test of a single service: the customer charged twice because the event was redelivered, the cancellation that arrives before the creation, the webhook that loses the race with the payment.

## When it is the right shape

- "If `subscription.status-changed` arrives twice, is the instalment paid twice?"
- "And if the cancellation arrives before billing knows the link exists?"
- "What is left inconsistent if the provider fails after we have already persisted?"

If the question fits inside a single service, the branch is [LOGIC.md](LOGIC.md).

## Process

### 1. Write the question and the actors

At the top of the page: the question, the services involved and the events they exchange. Use the real names. Take who publishes and who consumes each one from the event catalog (through its MCP, when one is connected; without it, the shared events package and each service's handlers). Up to four services: more than that, and the question is not sharp yet.

Write down the **invariants** that cannot break as well ("an instalment is never paid twice", "a cancelled subscription does not charge"). They are what the prototype watches.

### 2. Isolate each service's logic

In a single `<script>` block, each service is a pure module: it takes its own state and an event, and returns the new state and the events it publishes.

```js
// (state, event) => { state, publishes: [events] }
```

Beside them, an in-memory broker: one queue per consumer and one error queue (DLQ). An external provider is one more actor, with a "working / failing" switch. The modules know neither the page nor the broker. That is what lets each one move to the real event handler later.

### 3. Build the page

Plain HTML, CSS and JS in the same file, with no server and no real broker.

1. **Question and invariants** at the top. A broken invariant turns red, with the action that broke it.
2. **One column per service**, with its state in labelled fields.
3. **Messages in transit** in the middle. Each message has the buttons: **deliver**, **deliver again** (redelivery), **hold** (lets the ones that came later go through) and **drop** (goes to the DLQ).
4. **Triggers**: the buttons that start a flow (create, pay, cancel) and each provider's switch.
5. **Guided scripts**, one per tab, each starting from the initial state: the happy path; the same event twice; two events out of order; the provider fails and then comes back; two triggers racing each other.

After each click, highlight what changed in each column.

### 4. Hand it over

Send the file. Whoever knows the day-to-day operations tends to find the scenario that was missing: add it as a script.

### 5. Keep the answer

Each scenario that broke an invariant becomes a decision in the spec: what the idempotency key is, what the handler does with an out-of-order event, what goes to the DLQ and what is an expected outcome. A decision that is hard to undo becomes an ADR in the repository that owns the contract. The validated modules become the real handlers; the page goes to the prototype branch, as [SKILL.md](SKILL.md) says.
