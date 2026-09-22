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

## Which operations render

Only the operations sdkgen generates an entity method for, which are the keys
of sdkgen's `OP_SUFFIX`. sdkgen's `entityOps` appends every active operation,
and apidef emits `patch` as its own operation for an item route declaring both
PUT and PATCH, so an unrestricted loop renders a call to a method no target
declares. Keying off `OP_SUFFIX` means the set follows sdkgen rather than a
copy of it here.

## The argument a call carries

`primaryOpCall` phrases `list` without a match. A nested entity's list still
needs its parent keys, so docgen takes `matchArg` for `list` and substitutes
it into the argument position when it is non-empty.

`update` needs the same substitution. `dataArg` keeps only the required items
of the update shape, and an apidef point declares the path identifier as
required, so on a real model the call collapses to the identifier alone with
nothing to update. Docgen chooses the items the way the `ReadmeQuick_<lang>`
components do — the identifier, then the required items that are not the
identifier, then enough optional ones to reach two — and renders them through
`matchArg`, handing them back as the op's params. Every literal is still
spelled by sdkgen, and the identifier reads as it does in the `load` call
beside it rather than as a bare field value.

## Adding a language

Add the language to sdkgen's `ExampleLang`, `litPair`, `matchArg`, and
`primaryOpCall`, then add its binding to docgen's table. The union type
makes a missing binding a compile error.

## What the examples claim

The examples are rendered from the model and are not compiled or executed;
the page says so. Tests pin the rendered text per language.
