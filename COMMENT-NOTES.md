# Implementation rationale

Upstream specification prose reaches generated documentation. Normalization must preserve meaning: doubled-word cleanup uses a restricted vocabulary rather than collapsing every repeated word, since repetitions can be grammatical.

Spelling vocabulary harvested from API descriptions covers that API's domain terms. Do not expand it from the generator's own prose, which would exempt the prose that its quality checks are meant to validate.

Sources: [content normalization](ts/src/content.ts), [documentation generation](ts/src/docgen.ts).
