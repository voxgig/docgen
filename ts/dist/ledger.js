"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRelativePath = isRelativePath;
exports.relativePath = relativePath;
exports.inside = inside;
exports.within = within;
exports.ledgerText = ledgerText;
exports.readLedger = readLedger;
exports.prunePlan = prunePlan;
exports.applyPrune = applyPrune;
const node_path_1 = __importDefault(require("node:path"));
const VERSION = 2;
function isRelativePath(value) {
    return 'string' === typeof value && '' !== value && !value.includes('\\') &&
        !node_path_1.default.isAbsolute(value) && !value.split('/').some(x => !x || '.' === x || '..' === x) &&
        !/[\x00-\x1f]/.test(value);
}
function relativePath(value) {
    if (!isRelativePath(value)) {
        throw new Error('Expected a relative path inside the SDK repository: ' + value);
    }
    return value;
}
function inside(root, rel, fs) {
    const dest = node_path_1.default.join(root, relativePath(rel));
    // Reject symlink ancestors before any read or write can leave the project.
    let part = root;
    for (const p of rel.split('/')) {
        part = node_path_1.default.join(part, p);
        if (fs.existsSync(part) && fs.lstatSync(part).isSymbolicLink()) {
            throw new Error('Documentation path is a symlink: ' + part);
        }
    }
    return dest;
}
function within(root, path) {
    return path === root || path.startsWith(root + '/');
}
function ledgerText(roots, files) {
    const sorted = (list) => [...new Set(list)].sort();
    const ledger = { version: VERSION, roots: sorted(roots), files: sorted(files) };
    return JSON.stringify(ledger, null, 2) + '\n';
}
// A ledger is data on disk and can say anything, so nothing here throws and no
// entry is taken on trust. A stored ledger without roots keeps its file-level
// authority, and withholds the directory pruning that needs a root to stop at.
function readLedger(fs, path) {
    if (!fs.existsSync(path)) {
        return { roots: [], files: [], refused: [] };
    }
    let data;
    try {
        data = JSON.parse(String(fs.readFileSync(path, 'utf8')));
    }
    catch (err) {
        return { roots: [], files: [], refused: ['<unreadable: ' + (err?.message || err) + '>'] };
    }
    const refused = [];
    const keep = (list, what) => {
        if (!Array.isArray(list)) {
            refused.push('<' + what + ' is not a list>');
            return [];
        }
        return list.filter((value) => {
            if (isRelativePath(value))
                return true;
            refused.push(String(value));
            return false;
        });
    };
    const files = keep(data?.files, 'files');
    const roots = null == data?.roots ? files : keep(data.roots, 'roots');
    return { roots, files, refused };
}
function prunePlan(fs, root, previous, emitted) {
    const plan = { files: [], folders: [], refused: [...previous.refused] };
    const owned = (path) => previous.roots.some(r => within(r, path));
    for (const path of previous.files) {
        if (emitted.has(path))
            continue;
        if (!owned(path)) {
            plan.refused.push(path);
            continue;
        }
        let at;
        try {
            at = inside(root, path, fs);
        }
        catch {
            plan.refused.push(path);
            continue;
        }
        if (!fs.existsSync(at))
            continue;
        if (!fs.lstatSync(at).isFile()) {
            plan.refused.push(path);
            continue;
        }
        plan.files.push(path);
    }
    const candidates = new Set();
    for (const path of plan.files) {
        const parts = path.split('/');
        parts.pop();
        // A root is the floor: an empty directory above one belongs to the project.
        while (parts.length && owned(parts.join('/'))) {
            candidates.add(parts.join('/'));
            parts.pop();
        }
    }
    const going = new Set(plan.files), empty = new Set();
    // Deepest first, so a child is decided before the parent that holds it.
    for (const dir of [...candidates].sort((a, b) => b.split('/').length - a.split('/').length || a.localeCompare(b))) {
        const at = node_path_1.default.join(root, dir);
        if (!fs.existsSync(at))
            continue;
        const entries = fs.readdirSync(at).map(String);
        if (entries.every(name => going.has(dir + '/' + name) || empty.has(dir + '/' + name))) {
            empty.add(dir);
            plan.folders.push(dir);
        }
    }
    return plan;
}
function applyPrune(fs, root, plan) {
    for (const path of plan.files) {
        fs.unlinkSync(inside(root, path, fs));
    }
    // Already deepest first, and skipped if anything has arrived since.
    for (const dir of plan.folders) {
        const at = node_path_1.default.join(root, dir);
        if (fs.existsSync(at) && 0 === fs.readdirSync(at).length) {
            fs.rmdirSync(at);
        }
    }
}
//# sourceMappingURL=ledger.js.map