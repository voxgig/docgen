.PHONY: all build test clean reset version sync-docs check-docs publish

# Same entry points, and now the same shape, as sdkgen: the npm package root
# is ts/, and the repo root holds only what is not shipped. `make build test`
# works the same in either repo.

all: check-docs build test

build:
	cd ts && npm run build

test:
	cd ts && npm test

# Stamp ts/sdkgen-package.json from ts/package.json. Part of the release path
# (`npm run repo-publish-quick`); here on its own for checking a bump landed.
version:
	cd ts && npm run embed-version

clean:
	rm -rf ts/dist ts/dist-test

reset:
	cd ts && npm run reset

# THE MIRRORED FILES.
#
# README.md and LICENSE belong at the repo root — that is where GitHub looks
# and where a reader looks. npm can only ship files under the package root, so
# a copy has to exist inside ts/ as well, or the published package arrives with
# no readme and no licence text. (@voxgig/sdkgen's npm page has no README for
# exactly this reason: it moved to a ts/ package root and the file did not
# follow.)
#
# The root copy is canonical. Edit it, then `make sync-docs`; `make all` runs
# the check first, so drift is a build failure rather than something noticed
# after a release. Same arrangement sdkgen uses for its model file, and for the
# same constraint.
MIRRORED = README.md LICENSE

sync-docs:
	@for f in $(MIRRORED); do \
	  cp $$f ts/$$f; \
	done
	@echo "synced -> ts/ : $(MIRRORED)"

check-docs:
	@for f in $(MIRRORED); do \
	  cmp -s $$f ts/$$f || { echo "DRIFT: ts/$$f != $$f (run: make sync-docs)"; exit 1; }; \
	done
	@echo "mirrored files in sync"

# ONE COMMAND RELEASES THIS PACKAGE.
#
#   make publish V=0.10.0
#
# Bumps ts/package.json (and its lockfile) via `npm version
# --no-git-tag-version`, runs the full suite, commits, pushes main, and
# dispatches publish.yml — which publishes to npm and writes the v<V> tag.
#
# Every guard runs BEFORE anything is written, because a release cannot be
# taken back: npm never allows republishing a version.
#
# There is deliberately no version input on the workflow itself; it reads
# ts/package.json, so the dispatch and the file cannot disagree.
publish:
	@test -n "$(V)" || (echo "Usage: make publish V=x.y.z" && exit 1)
	@echo "$(V)" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+([-+].*)?$$' || \
	  (echo "publish: V=$(V) is not a semver x.y.z" && exit 1)
	@command -v gh >/dev/null 2>&1 || \
	  (echo "publish: needs the gh CLI to dispatch the workflow" && exit 1)
	@test "$$(git rev-parse --abbrev-ref HEAD)" = "main" || \
	  (echo "publish: must be on main (currently $$(git rev-parse --abbrev-ref HEAD))" && exit 1)
	@test -z "$$(git status --porcelain)" || \
	  (echo "publish: working tree is not clean" && exit 1)
	@git fetch origin main --quiet && test -z "$$(git rev-list HEAD..origin/main)" || \
	  (echo "publish: local main is behind origin/main" && exit 1)
	# ASK THE REMOTE, NOT THE CLONE. `git fetch origin main` does not fetch
	# tags, so a local rev-parse happily passes in a fresh or stale clone
	# while v$(V) already exists on origin — and by the time the workflow
	# refuses, this target has already bumped and pushed main.
	@if git ls-remote --exit-code --tags origin "refs/tags/v$(V)" >/dev/null 2>&1; then \
	  echo "publish: tag v$(V) already exists on origin"; exit 1; fi
	@if git rev-parse -q --verify "refs/tags/v$(V)" >/dev/null 2>&1; then \
	  echo "publish: tag v$(V) already exists locally"; exit 1; fi
	cd ts && npm version --no-git-tag-version $(V)
	# `npm version` updates package.json and its lockfile ONLY. This
	# repo also carries the version in generated files, and the suite
	# asserts they agree — so without this stamp `make all` below fails
	# on every real bump, and the release command could never work.
	cd ts && npm run embed-version
	$(MAKE) all
	git add ts/package.json ts/package-lock.json ts/sdkgen-package.json
	git commit -m "$(V)"
	git push origin main
	# `--ref main` is a MOVING target: another commit can land between the
	# push above and the run resolving, and get published under the
	# version just bumped. Pin the dispatch to the SHA we pushed.
	gh workflow run publish.yml --ref main -f expect_sha=$$(git rev-parse HEAD)
	@echo
	@echo "dispatched. watch with:  gh run list --workflow=publish.yml --limit 1"
