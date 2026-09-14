"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const github_pages_1 = require("../dist/admin/github-pages");
function fixture(mode, error) {
    const root = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-pages-setup-'));
    node_fs_1.default.mkdirSync(node_path_1.default.join(root, '.sdk/model'), { recursive: true });
    node_fs_1.default.mkdirSync(node_path_1.default.join(root, '.github/workflows'), { recursive: true });
    node_fs_1.default.writeFileSync(node_path_1.default.join(root, '.sdk/model/sdk.json'), JSON.stringify({ main: { kit: { doc: {
                    ci: { branch: 'release' }, edition: { site: { kind: 'github-pages', output: { path: 'docs' } } },
                } } } }));
    node_fs_1.default.writeFileSync(node_path_1.default.join(root, '.github/workflows/docgen.yml'), 'name: Documentation\n');
    const calls = [];
    const run = (args, cwd) => {
        strict_1.default.equal(cwd, root);
        calls.push(args);
        const ok = (data) => ({ status: 0, stdout: JSON.stringify(data), stderr: '' });
        if (args[0] === 'repo')
            return ok({ nameWithOwner: 'example/sdk', url: 'https://github.com/example/sdk' });
        if (args[0] === 'auth')
            return ok({});
        strict_1.default.deepEqual(args.slice(0, 4), ['api', '--hostname', 'github.com', 'repos/example/sdk/pages']);
        if (error)
            return { status: 1, stdout: JSON.stringify({ status: error }), stderr: 'HTTP ' + error };
        if (args.includes('--method')) {
            strict_1.default.equal(args[args.indexOf('--method') + 1], mode ? 'PUT' : 'POST');
            strict_1.default.deepEqual(args.slice(-2), ['-f', 'build_type=workflow']);
            mode = 'workflow';
            return ok({});
        }
        return mode ? ok({ build_type: mode, html_url: 'https://example.github.io/sdk/' }) : { status: 1, stdout: '{"status":"404"}', stderr: 'HTTP 404' };
    };
    return { root, run, calls, clean: () => node_fs_1.default.rmSync(root, { recursive: true, force: true }) };
}
(0, node_test_1.test)('Pages setup creates once, updates branch publishing, and leaves Actions sites alone', () => {
    for (const mode of [undefined, 'legacy', 'workflow']) {
        const f = fixture(mode);
        try {
            const result = (0, github_pages_1.setupGitHubPages)(f.root, {}, f.run);
            strict_1.default.equal(result.configured, true);
            strict_1.default.equal(result.branch, 'release');
            strict_1.default.equal(result.operation, mode === 'workflow' ? 'none' : mode ? 'update' : 'create');
            strict_1.default.equal((0, github_pages_1.setupGitHubPages)(f.root, {}, f.run).operation, 'none');
            strict_1.default.equal(f.calls.filter(a => a.includes('--method')).length, mode === 'workflow' ? 0 : 1);
        }
        finally {
            f.clean();
        }
    }
});
(0, node_test_1.test)('Pages dry-run/check and GitHub failures never write settings', () => {
    for (const options of [{ dryrun: true }, { check: true }]) {
        const f = fixture();
        try {
            strict_1.default.equal((0, github_pages_1.setupGitHubPages)(f.root, options, f.run).configured, false);
            strict_1.default.ok(!f.calls.some(a => a.includes('--method')));
        }
        finally {
            f.clean();
        }
    }
    for (const error of ['401', '403', '500']) {
        const f = fixture(undefined, error);
        try {
            strict_1.default.throws(() => (0, github_pages_1.setupGitHubPages)(f.root, {}, f.run), /HTTP/);
            strict_1.default.ok(!f.calls.some(a => a.includes('--method')));
        }
        finally {
            f.clean();
        }
    }
});
(0, node_test_1.test)('Pages setup refuses missing local generation before contacting GitHub', () => {
    const f = fixture();
    try {
        node_fs_1.default.unlinkSync(node_path_1.default.join(f.root, '.github/workflows/docgen.yml'));
        strict_1.default.throws(() => (0, github_pages_1.setupGitHubPages)(f.root, {}, f.run), /Generate .github/);
        strict_1.default.equal(f.calls.length, 0);
    }
    finally {
        f.clean();
    }
});
//# sourceMappingURL=github-pages.test.js.map