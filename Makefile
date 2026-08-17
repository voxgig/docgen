.PHONY: all build test clean reset version sync-docs check-docs

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
