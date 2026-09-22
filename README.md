# docgen

Docgen generates documentation editions from the existing apidef/sdkgen
model in an SDK project's `.sdk/` directory. Request and response details come
from apidef's resolved specification. SDK documentation components remain separate.

Model fields are keyed by name and use `n`, `h`, `t`, `r`, `a`, and `sh`.
Operation points use `m`, `o`, and `a`. Embedded JSON contracts are not read.
During an SDK build, docgen uses the resolved specification capability, including
any guide overrides. Standalone `voxgig-docgen generate` parses the original
`.sdk/def/<model.def>` file through the project's apidef installation. Use the
normal SDK build when documentation must include guide overrides.

| Edition | Default output | Content |
| --- | --- | --- |
| `summary` | `SUMMARY.md` | A few pages of Markdown orientation: capabilities, connection, first request, SDKs, and tools. |
| `github-pages` | `docs/` | Static HTML API, SDK, feature, and tool reference, guides, local search, and authored pages. |
| `presentation` | `docs/slidev/` | Editable Slidev Markdown and a build setup for an HTML presentation. |

`create-sdkgen` installs summary and GitHub Pages editions by default,
during project dependency installation. With `--no-install`, setup runs
after you install the project dependencies. Presentation is optional.
Each edition covers the project as a whole and can select targets,
entities, and features. Several instances can have different names and
output paths. One GitHub Pages deployment is allowed per repository.

## Install an edition

Run these commands from an existing SDK project's `.sdk/` directory:

```sh
npm install --save-dev @voxgig/docgen
npx voxgig-sdkgen edition add summary github-pages
npm run generate
```

Add the optional presentation:

```sh
npx voxgig-sdkgen edition add presentation
npm run generate
cd ../docs/slidev
npm install
npm run dev
npm run build
```

`build` writes the Slidev static application to `docs/slidev/dist/`.
The build uses local assets and does not require remote fonts at runtime.
Serve the built directory with a static HTTP server. A presentation nested
under the website is linked from the navigation and deployed with it. Only
its built assets are uploaded, with hash routing for static hosting. Set
`edition.presentation.site.active: false` to keep the presentation local.

An alias installs a separate instance:

```sh
npx voxgig-sdkgen edition add '@voxgig/docgen/project/summary~partner-summary'
```

Set a different output path for the alias before generating. `edition add`
resynchronises its components and templates; run `voxgig-sdkgen doctor`
to inspect changes before a resync.

## Configure the model

Put project settings in `.sdk/model/project.aon`. The installed edition
models include `@voxgig/docgen/model/docgen.aon` and extend `main.kit.doc`:

```aontu
main: kit: doc: {
  style: {
    color: primary: '#185f55'
    mode: 'auto'
    font: 'system-ui, sans-serif'
    headingFont: 'system-ui, sans-serif'
    headingFontFile: 'heading.woff2'
    monoFile: 'code.woff2'
    logo: 'logo.svg'
    fontFile: 'brand.woff2'
  }
  brand: {
    url: 'https://example.com'
    label: 'example.com'
    notice: 'Unofficial SDK. Not affiliated with the API provider.'
    shortNotice: 'Unofficial SDK. Not affiliated with the API provider.'
  }
  assets: path: '.sdk/doc/assets'
  content: path: '.sdk/doc/content'
  qa: vocabulary: ['UniVec', 'vectorise']
  ci: { active: true, branch: 'main' }
  edition: {
    summary: {
      output: path: 'SUMMARY.md'
      filter: targets: ['ts', 'go']
    }
    'github-pages': {
      output: path: 'docs'
      style: color: primary: '#2354c7'
    }
    presentation: {
      active: false
      kind: 'presentation'
      output: path: 'docs/slidev'
    }
  }
}
```

Use `light`, `dark`, or `auto` for `style.mode`. Colours are hex values.
Shared colour keys are `primary`, `background`, `text`, `darkBackground`,
and `darkText`. Each edition can override styling without changing the
others. Markdown summaries retain the host renderer's styling.

Output paths are relative to the SDK repository root. They must not
escape the repository or overlap an SDK target or project configuration.
A presentation can live under a website directory; its directory is reserved
for that edition. Other edition overlaps and file collisions are rejected. A summary path names a Markdown file; other editions name
a directory. Empty filter lists include every active item. Unknown or
inactive selections are errors.

## Content and customisation

Each installed edition has a component under
`.sdk/src/cmp/edition/<name>/Main_<name>.ts` and templates under
`.sdk/tm/edition/<name>/`. Components return their output files to docgen;
Jostraca writes the generated text. Edit the templates to change page
layout, navigation, styles, or the presentation structure, then regenerate.
The website's `page.html` uses named slots such as `{{content}}`, `{{nav}}`,
`{{title}}`, and `{{base}}`. SDK setup fragments live in `sdk-setup.json`.

Add handwritten Markdown under `.sdk/doc/content/`. Subdirectories and
relative links are preserved under `docs/additional/`. Local images beside
the Markdown are copied with it. Generated pages and assets are recorded
in `.sdk/doc/generated.json`, so retired generated pages are removed on
the next run. Files not owned by docgen are preserved.

### Retiring generated output

Generation overwrites in place, which keeps existing files correct but
cannot make one disappear. An edition emits a page per entity, per
operation, per target and per feature, so the set of files it writes is a
function of the model: an entity that leaves the specification has to take
its page with it, or the published site keeps serving a page for something
the SDK no longer has.

Each run therefore records what it wrote in `.sdk/doc/generated.json` — the
files, and the output roots those files sit under. The next run removes a
file only when the stored record named it, that name resolves inside one of
the stored roots, and this run did not write it again. A directory goes only
when everything left in it is going too, so removing the last page of a
per-entity directory does not leave an empty one behind serving a
404-shaped index.

Nothing else is ever removed. A handwritten page, an image a writer added, a
workflow docgen does not generate and anything under `.sdk/doc/content/` is
outside every recorded root, so it survives even if the record names it. The
record is read as untrusted data: an absolute path, a path containing `..`,
a path through a symlink, an entry of the wrong type or an unreadable file
prunes nothing and is reported instead.

**Commit `.sdk/doc/generated.json` with the output it describes.** The
generated site is committed to the SDK repository, and the Pages workflow
regenerates it from a fresh checkout before staging. A checkout without the
record cannot know what the previous run wrote, so it prunes nothing and
writes a new record — safe, but a stale page committed earlier would be
published again. Committing it costs nothing when the generated tree itself
is ignored: an entry naming a file that is not there is skipped. Nothing in
the shipped scaffold ignores the record, so the default is correct; an
ignore rule covering `.sdk/doc/` turns the prune off for everyone but the
workstation that last generated twice.

To see what a run would retire without writing anything:

```sh
node .sdk/node_modules/@voxgig/docgen/bin/voxgig-docgen generate . --dry-run
```

Turning documentation off — `doc.active: false`, or leaving no active
edition — stops generation altogether, so it also stops the prune and leaves
the existing tree in place. To retire one edition's output, remove or
deactivate that edition while another stays active and regenerate.

Entity reference pages include a code example per SDK target, calling
each operation with the entity's own parameter and field names. Docgen
phrases the call with sdkgen's example helpers, so the examples share the
phrasing sdkgen uses for a primary operation call. They are not a copy of a
generated quick-start README, which each target phrases for itself (the Ruby
README calls a factory without parentheses). TypeScript, JavaScript, Python,
PHP, Ruby, Lua, and Go are covered; a target in another language renders no
example. The examples come from the model and are not compiled or executed.
See [docs/design/entity-examples.md](docs/design/entity-examples.md).

Add target-specific descriptions, installation instructions, setup
examples, or MCP tool schemas under `main.kit.doc.target.<target>`.
The fields are `kind`, `description`, `install`, `example`, `language`,
and `tool.<name>.{description,input}`. The bundled Go MCP adapter describes
its list and load tools using the current entity selection. Explicit tool
contracts override that adapter. Other tool surfaces can provide their
contracts in the model without changing docgen.

## Text QA and GitHub Pages

Docgen generates `.github/workflows/docgen.yml`. It regenerates the
project, runs the local prose gate and Vale against all active editions,
builds any presentations, and deploys the HTML site after checks pass on
`main`. Pull requests run checks without deployment. Set the repository's
Pages source to **GitHub Actions** before the first deployment.
Pages staging selects files from `.sdk/doc/generated.json`; project-owned
notes under `docs/` are excluded from the uploaded artifact.

Run the same text checks from the SDK repository root:

```sh
vale --config=.sdk/doc/qa/vale.ini sync
node .sdk/node_modules/@voxgig/docgen/bin/voxgig-docgen qa
```

The [style guide](docs/STYLE-GUIDE.md) adapts aontu's rules to neutral API
and SDK prose. The output manifest includes every edition and authored
page. `qa --local-only` runs the fast checks without Vale; CI requires both.
Use `ci.active: false` to manage the workflow separately.

## Develop

The npm package root is `ts/`. Bundled edition models, components, and
templates live in `ts/project/.sdk/`, beside
`ts/project/sdkgen-package.json`, matching sdkgen's scaffold layout.
Install the whole scaffold with `voxgig-sdkgen package add @voxgig/docgen/project`.

Build and test from the repository root:

```sh
make all
```

Tests generate all editions, check output links, filters, aliases, local
assets, safe output paths, dry runs, text rules, and package contents.
The text QA workflow generates a fixture covering every edition and runs
Vale against its output. This README is the full documentation;
`ts/README.md` is a short package summary that links here. The model lives
in `ts/model/`, and the authoritative license is [ts/LICENSE](ts/LICENSE).
Edit these files directly; no content is mirrored between the repository
and package roots.

This refactor replaces `docs/apidocs`. Existing projects must remove the
old docs index include and install editions. Install the coordinated
sdkgen 4.17.0 and docgen 0.10.0 versions before using the new commands.

### Site and presentation identity

The default theme follows [voxgig.com](https://voxgig.com/): a light background
(`#f5f5f9`), dark text (`#0a0a0a`), Voxgig red (`#e70042`), teal accents
(`#00c6d8`), and locally bundled Nunito typography. The font license is included
in generated sites and presentation builds. Dark mode remains configurable.

Project settings under `main.kit.doc.style` override these defaults; an edition's
`style` overrides the shared project settings. Provider branding and notices
belong in `doc.brand`. For example, Univec's green palette, Manrope and IBM Plex
fonts, and univec.ai link are project customisations, not docgen defaults.


`doc.brand` configures the provider link and project notice. The website shows
the link in its header and the notice below it. The presentation uses a
persistent frame with the title, provider link, notice, and current/total slide
numbers, including when no logo is configured. An edition can override `brand`.
The summary and presentation opening also include the full notice.

`style.headingFont` configures headings. Local WOFF/WOFF2 assets use `fontFile`,
`headingFontFile`, and `monoFile`; their paths are relative to `doc.assets.path`.
Put each font license beside the font as `<filename>.license.txt` so generation
copies it into both outputs. `style.color.accent` controls secondary accents.
Presentation styles are scoped to slide content and the frame. Text QA includes
the generated Vue frame as well as Markdown and HTML.

### GitHub Pages administration

With an active Pages edition and its CI workflow, generation writes the
executable `.sdk/admin/setup-github-pages.sh`. It uses the current GitHub
repository and the compiled documentation model. Run it from any directory:

```sh
.sdk/admin/setup-github-pages.sh --dry-run
.sdk/admin/setup-github-pages.sh --check
.sdk/admin/setup-github-pages.sh
```

The default command creates a Pages site or changes its publishing source to
GitHub Actions. Repeated runs leave an existing Actions setup alone. `--dry-run`
only reports the proposed change; `--check` returns nonzero when setup is needed.
Authenticate `gh` first. The script does not commit, push, merge, or deploy.
Push the generated workflow and project changes to `doc.ci.branch` to publish.

Docgen owns this script. Setup requires an active Pages edition and CI workflow.
Other files in `.sdk/admin`, including the standard status script supplied by
create-sdkgen, remain under their existing owners.
