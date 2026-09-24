"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGitHubPages = setupGitHubPages;
exports.main = main;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const runGh = (args, root) => (0, node_child_process_1.spawnSync)('gh', args, { cwd: root, encoding: 'utf8', timeout: 30000, windowsHide: true });
function setupGitHubPages(root, options = {}, run = runGh) {
    root = node_path_1.default.resolve(root);
    const file = node_path_1.default.join(root, '.sdk/model/sdk.json');
    if (!node_fs_1.default.existsSync(file))
        throw new Error('Generate the SDK model and documentation before configuring Pages.');
    const doc = JSON.parse(node_fs_1.default.readFileSync(file, 'utf8')).main?.kit?.doc;
    const sites = Object.entries(doc?.edition || {}).filter(([, e]) => e.active !== false && e.kind === 'github-pages');
    if (doc?.active === false || doc?.ci?.active === false || sites.length !== 1)
        throw new Error('Enable one GitHub Pages edition and its CI workflow, then regenerate documentation.');
    if (!node_fs_1.default.existsSync(node_path_1.default.join(root, '.github/workflows/docgen.yml')))
        throw new Error('Generate .github/workflows/docgen.yml before configuring Pages.');
    const success = (result) => {
        if (result.status !== 0)
            throw new Error(result.error?.message || result.stderr.trim() || result.stdout.trim() || 'GitHub CLI request failed');
        return result.stdout.trim() ? JSON.parse(result.stdout) : {};
    };
    const repository = success(run(['repo', 'view', '--json', 'nameWithOwner,url'], root));
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository.nameWithOwner || ''))
        throw new Error('GitHub CLI returned an invalid repository name.');
    const host = new URL(repository.url).hostname;
    const auth = run(['auth', 'status', '--hostname', host], root);
    if (auth.status !== 0)
        throw new Error('Authenticate gh for ' + host + ' before configuring Pages. ' + (auth.error?.message || auth.stderr.trim()));
    const endpoint = 'repos/' + repository.nameWithOwner + '/pages';
    const api = ['api', '--hostname', host, endpoint];
    const before = run(api, root);
    let existing;
    try {
        existing = JSON.parse(before.stdout || '{}');
    }
    catch {
        existing = {};
    }
    // A permissions, network, or service failure must never be mistaken for a missing site.
    if (before.status !== 0 && String(existing.status) !== '404')
        success(before);
    const operation = before.status !== 0 ? 'create' : existing.build_type === 'workflow' ? 'none' : 'update';
    let site = existing;
    if (operation !== 'none' && !options.dryrun && !options.check) {
        success(run([...api, '--method', operation === 'create' ? 'POST' : 'PUT', '-f', 'build_type=workflow'], root));
        site = success(run(api, root));
        if (site.build_type !== 'workflow')
            throw new Error('Pages did not report GitHub Actions as its publishing source after setup.');
    }
    return { repository: repository.nameWithOwner, operation,
        configured: site.build_type === 'workflow', url: site.html_url || null,
        branch: doc.ci?.branch || 'main', edition: sites[0][0], dryrun: !!options.dryrun, check: !!options.check };
}
function main(args = process.argv.slice(2)) {
    const root = args.shift();
    if (args.includes('--help') || root === '--help') {
        console.log('Usage: .sdk/admin/setup-github-pages.sh [--dry-run | --check]\nConfigure GitHub Pages to deploy through the generated GitHub Actions workflow.\n--dry-run reports the proposed change; --check returns nonzero if setup is needed.\nThis does not commit, push, merge, or deploy. Authenticate gh before running it.');
        return 0;
    }
    if (!root || args.some(a => !['--dry-run', '--check'].includes(a)) || args.length > 1)
        throw new Error('Usage: setup-github-pages.sh [--dry-run | --check]');
    const result = setupGitHubPages(root, { dryrun: args.includes('--dry-run'), check: args.includes('--check') });
    console.log('Repository: ' + result.repository);
    console.log(result.configured ? 'Pages uses GitHub Actions.' : (result.dryrun ? 'Would ' : 'Setup needed: ') + result.operation + ' Pages with GitHub Actions as its publishing source.');
    if (result.url)
        console.log('Website: ' + result.url);
    console.log('Deployment branch: ' + result.branch + '. Commit and push the generated workflow and project changes to this branch to publish.');
    // Enabling Pages is repository state; the model cannot observe it. Generated
    // documentation links the site only when the project records it, so say how.
    if (result.configured && !result.dryrun && !result.check) {
        console.log('Record the live site in .sdk/model/project.aontu, so generated documentation may link it:');
        console.log("  main: kit: doc: edition: '" + result.edition + "': published: true");
    }
    return result.check && !result.configured ? 1 : 0;
}
if (require.main === module) {
    try {
        process.exitCode = main();
    }
    catch (err) {
        console.error(err.message);
        process.exitCode = 1;
    }
}
//# sourceMappingURL=github-pages.js.map