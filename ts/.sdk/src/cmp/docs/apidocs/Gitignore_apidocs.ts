// The site's `.gitignore` — GENERATED, not templated, and that is forced.
//
// npm never publishes a file named `.gitignore`. It is on npm's own
// always-excluded list, and listing the parent directory in `files` does not
// override it: `npm pack --dry-run` on this package omits it. So a template
// copy of this file works from a checkout and silently vanishes for everyone
// who installs @voxgig/docgen the normal way — leaving `site/` and `.cache/`
// untracked in a fresh docs repo, one `git add .` away from a committed
// build directory.
//
// Emitting it from a component is also simply the house convention: every
// SDKGEN language target ships `Gitignore_<lang>.ts` for the same reason.
// (sdkgen's own `tm/seneca-provider/.gitignore` is the exception, and the
// tarball drops that one too.)
//
// `package-shape.test.ts` asks npm directly whether every `.sdk` file
// survives packing, so the next dotfile added to `tm/` cannot repeat this.

import { Content, File, cmp } from '@voxgig/sdkgen'


const Gitignore = cmp(function Gitignore(_props: any) {
  File({ name: '.gitignore' }, () => {
    Content(`# Built site — regenerate with \`make build\`.
site/

# mkdocs build cache
.cache/

# Python environment for the build (see requirements.txt)
.venv/
venv/
__pycache__/
*.pyc

# IDE / OS
.idea/
.vscode/
.DS_Store
`)
  })
})


export {
  Gitignore
}
