# docgen — agent guide

`CLAUDE.md` is a symlink to this file, so the guide an agent session loads and
the guide a person reads are one document. There is nothing to keep in step:
do not replace the symlink with a second copy, and do not restate a rule here
for the sake of the other file name.

## This repository is worked on from more than one machine

Work happens here on more than one machine, and in ephemeral containers whose
installed software differs from each other and from any developer's
workstation. A toolchain, a path, or a version present in one is routinely
absent in the next.

So never record an inventory of what is installed as though it were a property
of this repository, and never conclude that something cannot be built, run, or
verified without checking the current environment first — `command -v <tool>`
settles it in a second. A note anywhere in this repository saying a tool "was
not available" is a fact about the environment that note was written in, and
never about yours. Read an absolute path in any note, log, or comment the same
way: as an example, to be substituted with your own checkout.

State what a run requires rather than what some past run found, and cite the
file that enforces it. The Node floor is `engines.node` in `ts/package.json`.
`make publish` probes for `gh` and refuses the dispatch without it, and
`.githooks/pre-push` probes for `node` before running the comment gate — that
is the pattern to copy. The Vale release the prose QA measures against is
`VALE_VERSION` in `.github/workflows/text-qa.yml`, because a prose result is
comparable between two machines only when both ran the same binary -- and a
`vale` already on your PATH is whatever you installed, not that release. The operating systems
and Node versions the suite runs on live in `.github/workflows/build.yml`; read
the matrix there rather than copying it here, where the copy would go stale
unnoticed.

Where a gate genuinely cannot run where you are, name it and say why, rather
than letting the checks that did run stand in for the whole.

## Temporary local tool development

Prefer local symlinks to sibling tool checkouts when developing or testing
unreleased Voxgig tools together. Link to the actual package root (for example,
`apidef/ts` or `sdkgen/ts`), build that checkout, and verify that the consumer
resolves the linked code. Use existing validator local-path options where
available.

Do not create or copy `.zip`, `.tgz`, or `npm pack` snapshots into SDK projects
or ad hoc `vendor/` folders just to use local changes. Keep temporary links in
ignored dependency directories; keep machine-specific paths and temporary
`file:` dependencies out of committed manifests and lockfiles. Shared builds
and CI should use published versions or explicitly check out and build the
required source revisions.

Archives are appropriate when testing package contents or installation from a
packed release. Put those artifacts in a temporary test directory and clean
up artifacts created by the test afterward; do not scatter them across repos.


## Source code comments

Follow [COMMENT-POLICY.md](COMMENT-POLICY.md): comments are sparse and terse,
only for intricate or surprising code. Names carry intent; documents carry
requirements. Run `make comments comments-test` after editing source.

Durable implementation rationale is in [COMMENT-NOTES.md](COMMENT-NOTES.md).
