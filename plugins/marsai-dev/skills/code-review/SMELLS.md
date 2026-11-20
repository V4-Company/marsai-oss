# Review baseline

It applies in any repository, even where nothing is documented. Each item is a heuristic ("possible Feature Envy"), not a violation: it is always a judgement call. A documented rule of the repository or of the team overrides this list.

Each item says what it is and how to fix it.

## Design (Fowler, *Refactoring*, ch. 3)

- **Mysterious Name**: a function, variable or type whose name does not reveal what it does or holds. → Rename it. If no honest name comes out, the design is muddy.
- **Duplicated Code**: the same logic in more than one place in the change. → Extract it and call it from both places.
- **Feature Envy**: a method that works more with another object's data than with its own. → Move the method to where the data is.
- **Data Clumps**: the same fields or parameters travelling together. → Group them in a type and pass the type.
- **Primitive Obsession**: a string or number playing the role of a domain concept. → Give the concept a value object.
- **Repeated Switches**: the same `switch` or `if` cascade over the same type in several places. → Polymorphism, or a shared map.
- **Shotgun Surgery**: one logical change that needs edits scattered across many files. → Bring together what changes together.
- **Divergent Change**: one file edited for several unrelated reasons. → Split it, one reason per module.
- **Speculative Generality**: an abstraction, parameter or hook for a need the spec does not have; an interface with a single implementation. → Delete it and leave the code direct.
- **Message Chains**: `a.b().c().d()` that the caller should not depend on. → Hide the path behind a method of the first object.
- **Middle Man**: a class or function that only passes things on. → Cut it and call the target.
- **Refused Bequest**: a subclass that ignores or overrides almost everything it inherits. → Replace inheritance with composition.
- **Overly complex function**: many paths and levels of nesting in the same function. → Return early and extract the branches into named functions. This is what the static analysis in CI measures as complexity.

## Database

- **Unbounded query**: a listing that brings back the whole table, with no pagination or cap. → Paginate, or limit it and say why.
- **Query inside a loop** (N+1): one trip to the database per item of a list. → A single query, with `in` or a join.
- **Filter or sort on a column with no index** in a table that grows. → Create the index in the same migration, or report it.
- **Extra columns**: selects everything when it uses two fields, in a wide table or one with sensitive data. → Select what you use.
- **Long transaction**: a call to an external service or a network wait inside the transaction. → Close the transaction before calling out of the process.

## Code written by an agent

- **Phantom dependency**: an import of a package that is not in `package.json`, or a package added that does not exist in the registry (`npm view <package> version` confirms). → Remove it or replace it with the real one. It is the only item on this list that is not a judgement call.
- **Out of scope**: a file changed or created that the ticket does not ask for. → Take it out of the branch and report it.
- **Did not read the neighbourhood**: new code that ignores the pattern of the file next to it (another way of handling errors, of naming, of organising imports). → Align it with the neighbourhood.
- **Draft leftovers**: a `TODO` with no owner, a fake return, an empty `catch`, commented-out code. → Remove it or report it as pending.
- **Comment that narrates the task**: a reference to a ticket, to a review or to what was there before (`// FIX 2`, `// used X before`), and section separators. → Remove it. The git history keeps that.

## Tests

- **Tautological**: the expected value repeats the implementation or is computed the same way. → Replace it with a known literal or an example worked out by hand.
- **Tied to the implementation**: checks a call, an order or a private method instead of a result; breaks on a refactoring with no change in behaviour. → Check the result, through the public interface.
- **Cannot fail**: the dependency was replaced by something that always responds correctly, and no test exercises the failure. → Add the case in which the dependency fails the way the real one does.
- **Reads the source code**: opens the file as text and looks for snippets, instead of executing it. → Execute or render and check what happens.
- **Happy path only** on a new behaviour with a business rule. → Add the edge case and the error the rule defines.
