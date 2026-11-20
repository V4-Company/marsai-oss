# Good and bad tests

## Good: observable behaviour

```typescript
it('cancels the subscription when the recurring deal is cancelled', async () => {
  const link = await createPaidLink({ subscriptions: 2 });

  await cancelLink.execute({ id: link.id, reason: 'DEAL_CANCELED' });

  const after = await links.findById(link.id);
  expect(after.status).toBe('CANCELED');
  expect(provider.canceledSubscriptions).toHaveLength(2);
});
```

- It tests what the caller sees.
- It uses only the public interface.
- It survives an internal refactoring.
- The name says what, not how.

## Bad: tied to the implementation

```typescript
it('calls repository.save with the CANCELED status', async () => {
  await cancelLink.execute({ id, reason: 'DEAL_CANCELED' });

  expect(repository.save).toHaveBeenCalledWith(
    expect.objectContaining({ status: 'CANCELED' }),
  );
});
```

Signs: an assertion on how many times or in what order something was called; a test of a private method; a name that describes the how; a test that breaks on a refactoring with no change in behaviour.

```typescript
// Bad: checks from outside the interface
it('createUser writes to the database', async () => {
  await createUser({ name: 'Alice' });
  const row = await db.selectFrom('users').where('name', '=', 'Alice').executeTakeFirst();
  expect(row).toBeDefined();
});

// Good: checks through the interface
it('a created user can be fetched', async () => {
  const user = await createUser({ name: 'Alice' });
  expect((await getUser(user.id)).name).toBe('Alice');
});
```

Checking the database directly is the job of an end-to-end test against the running service, not of the use case test.

## Bad: tautological

```typescript
// Bad: the expected value repeats the implementation
it('character limit is 280', () => {
  expect(POST_CHARACTER_LIMIT).toBe(280);
});

// Bad: the expected value is calculated the way the code calculates it
it('adds up the instalments', () => {
  const expected = instalments.reduce((s, p) => s + p.amountCents, 0);
  expect(contractTotal(instalments)).toBe(expected);
});

// Good: the expected value is a known literal
it('adds up the instalments', () => {
  expect(contractTotal([{ amountCents: 1000 }, { amountCents: 500 }])).toBe(1500);
});
```

## Bad: reads the source code instead of running it

```typescript
// Bad: opens the component file and looks for text inside it
const source = readFileSync('src/app/deal/page.tsx', 'utf8');
expect(source.indexOf('Instalments')).toBeLessThan(source.indexOf('History'));
```

The test breaks on any formatting change and proves nothing about the screen. Render it and check what appears.
