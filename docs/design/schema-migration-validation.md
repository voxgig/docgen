# Compact schema validation

Validated locally on 2026-09-21 from docgen main `baa9f4f`, using symlinked
sdkgen, apidef 8.13.0, and Aontu 0.71.0 source checkouts.

## Package checks

- Build and 37 tests pass, including standalone specification loading, build
  capability precedence, field maps, human titles, active routes, alphabetical
  property/example ordering, and QA vocabulary derived from specification facts.
- Comment policy and its nine tests pass; whitespace checks pass.
- All three editions pass rendered-text QA with Vale: 13 fixture files.
- Petstore, Solar, and Taxonomy pass local text and link QA: 19, 17, and 20 files.

## Integration

`sdkgen-validate` runs with documentation enabled and `--docgen-path` pointing
to this checkout. The remaining local-path options select the matching sdkgen,
apidef, Aontu, and create-sdkgen source checkouts. SDK targets are TS, JS, Go,
Python, PHP, Ruby, and Lua.

Each project generates its summary and GitHub Pages editions. The fixture suite
also generates presentations. Runtime SDK dependencies and documentation
components use local symlinks; manifests contain no machine-specific paths.

## Text QA findings

Vendor specification prose causes text-policy findings in Cloudsmith, Codat
Platform, Contentful CMA, DingConnect, Shortcut, Statuspage, and GitLab. Findings
include first-person prose, exclamation marks, and repeated words. For example,
Cloudsmith's source response descriptions include “upgrade your account!”. These
findings are reported without changing the specification's meaning or relaxing
QA rules. They are separate from schema compatibility and generation success.

## Standalone behavior

A normal SDK build supplies apidef's resolved capability, including guide
adjustments. Standalone generation reads the original definition using the
project's apidef parser. Generate through the normal SDK build when guide
adjustments must appear in documentation. A model with no definition can still
render model-only documentation; a declared but missing definition fails.
