.PHONY: all build test clean reset version

# The same entry points sdkgen's Makefile offers, so the two repos are driven
# the same way — `make build test` works in either. The delegation is simpler
# here: sdkgen's npm package root is ts/, and its model/ is mirrored into it
# because npm can only ship files under the package root. This package IS the
# repo root, so there is nothing to cd into and nothing to mirror.

all: build test

build:
	npm run build

test:
	npm test

# Stamp sdkgen-package.json from package.json. Part of the release path
# (`npm run repo-publish-quick`); here on its own for checking a bump landed.
version:
	npm run embed-version

clean:
	rm -rf dist dist-test

reset:
	npm run reset
