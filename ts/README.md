# docgen

Voxgig Documentation Generator — an **sdkgen package** supplying
documentation targets for an API and the SDKs generated from it.

## What it is

[`@voxgig/sdkgen`](https://github.com/voxgig/sdkgen) generates client SDKs
from an OpenAPI-derived model. It also defines a `docs` **kind**: a
generation target whose destination is a documentation system rather than
a language. This package supplies the items for that kind.

Install one into an SDK project:

```bash
npm install --save-dev @voxgig/docgen
cd <sdk-project>/.sdk
voxgig-sdkgen package add @voxgig/docgen
npm run build && npm run generate
```

## Items

| Item | Emits |
| --- | --- |
| `apidocs` | A static documentation site (mkdocs-material): an overview, a page per entity with its operations, a page per installed SDK with its install command and publication state, and a page per active feature. `mkdocs.yml` — including the nav — is generated from the model. |

The site generates into `<sdk-project>/apidocs/` by default. A
documentation site usually wants its own repo, so point it somewhere:

```jsonic
main: kit: docs: apidocs: output: path: '../my-docs-site'
```

Then:

```bash
cd apidocs && make serve
```

## Why mkdocs and not an MDX engine

The site interpolates the API's **own** description fields — `info.summary`,
entity descriptions — and those belong to whoever wrote the OpenAPI
document. MDX parses `{` as an expression and `<tag` as JSX in prose, so a
description containing either breaks the consumer's site build for reasons
that are not their fault. Under CommonMark the same text is inert.

(Measured, not assumed: generating every sdkgen target's documentation
produced 224 markdown files with zero MDX hazards in *our* prose — the
hazard is entirely in the spec text passing through.)

mkdocs is also what Backstage TechDocs runs, so a catalogue item added
later inherits this emitter.

## Developing

The npm package root is **`ts/`** — run npm commands there, or use the
top-level `Makefile`, which wraps them. Same layout as `@voxgig/sdkgen`.

```bash
make build test                        # from the repo root
cd ts && npm install && npm run build && npm test
```

`README.md` and `LICENSE` live at the repo root and are mirrored into `ts/`,
because npm ships nothing from above the package root. Edit the root copy,
then `make sync-docs`; `make all` and the suite both fail on drift.

The suite checks this package's own shape — the manifest against the disk,
each item's model file. The end-to-end check belongs to sdkgen:

```bash
voxgig-sdkgen package check ./ts       # the PACKAGE root, not the repo root
```

and then, in a real project, a clean `voxgig-sdkgen doctor` immediately
after `package add`.
