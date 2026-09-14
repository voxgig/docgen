# @voxgig/docgen

Generate documentation editions from an existing apidef/sdkgen model.

See the [top-level README](https://github.com/voxgig/docgen/blob/main/README.md)
for installation, usage, and development instructions.

Licensed under the [MIT License](LICENSE).

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
