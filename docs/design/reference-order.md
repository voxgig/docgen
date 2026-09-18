# Reference order

Reference tables and rendered examples are keyed **by name**, sorted in
`schemaRows` and in `stableJson`.

That order is not new. It is what the pages already had — but only as a
side effect of how the facts reached docgen. apidef serialised a point's
contract with its keys sorted, so every property table and every example
came out alphabetical without anyone deciding it should.

Reading the resolved definition instead gives **specification order**,
which is the order the vendor wrote. Adopting it would have been
defensible, and it would also have rewritten every published reference
page in the fleet on the next regeneration — a diff of thousands of
lines, none of it a change in content.

So the sort moved into docgen, where it is a decision. The pages are
stable across the change, the order is stated in one place, and it can be
revisited on its own merits rather than as a consequence of a transport
detail.

`resolved-parity.test.ts` holds the two renderings byte-identical.
