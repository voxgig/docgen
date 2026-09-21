# Entity examples

Each entity reference page carries one code block per SDK target, showing
every active operation of the entity called with its real parameter and
field names. The block assumes the `client` that the target's own SDK page
constructs, and links to that page.

## One phrasing, shared with sdkgen

The call expression (entity accessor, method spelling, argument literals)
is sdkgen's `primaryOpCall`, the helper its README components use. Docgen
adds only what a README block already has around the call: how the language
binds the result (`const x = await`, `x, err :=`, `$x = ...;`), and the
result name per operation. A change to how sdkgen phrases a call reaches the
reference without a docgen change, and the reference cannot disagree with
the README.

The language of a target is `origname`, or `name` when the target is not an
alias, matched against sdkgen's `ExampleLang` union. Docgen's binding table
in `ts/src/examples.ts` is the other half of the contract: a target gets an
example only when both cover its language. A target whose language neither
covers renders no example rather than a guessed one.

`primaryOpCall` phrases `list` without a match. A nested entity's list still
needs its parent keys, so docgen takes `matchArg` for `list` and substitutes
it into the argument position when it is non-empty.

## Adding a language

Add the language to sdkgen's `ExampleLang`, `litPair`, `matchArg`, and
`primaryOpCall`, then add its binding to docgen's table. The union type
makes a missing binding a compile error.

## What the examples claim

The examples are rendered from the model and are not compiled or executed;
the page says so. Tests pin the rendered text per language.
