# When to replace a dependency

Replace only what sits at the **edge of the system**:

- Database: the repository port.
- External service: the provider or gateway (the payment provider, email, the ERP).
- Event broker.
- Time and randomness.

Do not replace what is yours: your classes, your services, internal collaborators. Let the real code run.

## How to replace

Follow the pattern the repository already uses: some services have an in-memory repository and an entity factory, and some use Vitest's `Mocked<T>`. In both cases, check the **result**, not the call.

```typescript
// Checks the result: survives an internal change
await createOffer.execute(input);
expect(offers.items).toHaveLength(1);
expect(offers.items[0].props.status.value).toBe('OPEN');

// Checks the call: breaks if the use case starts saving another way
expect(offersMock.save).toHaveBeenCalledTimes(1);
```

An assertion on the call fits when the call **is** the effect: the email sent, the event published, the `DELETE` made at the provider.

## Let the substitute fail like the real thing

A substitute that always responds correctly hides the failure modes of the dependency. For a provider, a gateway and a broker, have at least one test in which the substitute fails the way the real one fails (timeout, refusal, invalid response) and check what the code does.

## Design to be replaceable

- Receive the dependency by injection, instead of creating it inside.
- Prefer a port with one function per operation (`provider.cancelSubscription(id)`) to a generic function (`provider.request(endpoint, options)`). Each substitute returns one format only, and the test shows which operation it exercises.
