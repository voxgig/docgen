"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALE_OWN = exports.VALE_ALL = exports.valeText = void 0;
exports.proseText = proseText;
exports.authored = authored;
exports.checkText = checkText;
exports.runQA = runQA;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_child_process_1 = require("node:child_process");
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({ html: false });
const PACKAGE = node_path_1.default.resolve(__dirname, '..');
const stripUrls = (s) => s.replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>"')\]]+/gi, ' ');
// Hyphenated, these are region or locale codes; after a slash, a route such as /me; in upper case, the plural object names the country.
const FIRST_PERSON = /(?<![-/])\b(?:I|me|my|mine|we|our|ours)\b(?![-/])/i;
const PLURAL_OBJECT = /(?<![-/])\bus\b(?![-/])/;
// `code` stands in for removed code, so a check can tell the words around it apart.
function proseText(source, format = 'md', code = ' ') {
    if (format === 'html' || format === 'vue') {
        if (format === 'vue')
            source = source.replace(/\{\{[^]*?\}\}/g, ' ');
        source = source.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, code)
            .replace(/<!--[^]*?-->/g, '').replace(/<\/(?:p|h[1-6]|li|tr|td|th|div|nav|header|main|summary|details|footer|aside|span)>/gi, '\n\n').replace(/<[^>]+>/g, ' ');
        return stripUrls(md.utils.unescapeAll(source)).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    source = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/<!--[\s\S]*?-->/g, '');
    const collect = (tokens) => tokens.map(t => {
        if (['fence', 'code_block', 'code_inline'].includes(t.type))
            return code;
        if (['html_block', 'html_inline'].includes(t.type))
            return '';
        if (t.children)
            return collect(t.children);
        return t.type === 'text' ? md.utils.unescapeAll(t.content) : t.type.endsWith('_close') ? '\n\n' : ' ';
    }).join(' ');
    return stripUrls(collect(md.parse(source, {}))).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
// Without table cells and quoted vendor text. A quote is matched by its words,
// whatever markup surrounds it, longest first so a shorter one cannot split it.
function authored(source, format, quoted = []) {
    const stripped = 'html' === format || 'vue' === format
        ? source.replace(/<td\b[^>]*>[\s\S]*?<\/td>/gi, ' ')
        : source.split('\n').filter(line => !/^\s*\|/.test(line)).join('\n');
    let text = proseText(stripped, format);
    // Block by block: a quote with a table in it never matches whole, since the
    // page has lost the cells; and a quote on a rendered page is already blocks.
    for (const quote of [...quoted].sort((a, b) => b.length - a.length)) {
        for (const block of proseText(quote).split(/\n{2,}/)) {
            const words = block.split(/\s+/).filter(Boolean);
            if (!words.length)
                continue;
            const edge = (word) => /\w/.test(word) ? '\\b' : '';
            const pattern = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
            text = text.replace(new RegExp(edge(words[0][0]) + pattern + edge(words[words.length - 1].slice(-1)), 'g'), ' ');
        }
    }
    return text;
}
// The Vale defect rules read everything rendered, vendor cells included; its
// identifiers render as code. House style reads authored(), split in vale.ini.
exports.valeText = proseText;
exports.VALE_ALL = '.all.txt', exports.VALE_OWN = '.own.txt';
// A house-style rule says how THIS PROJECT writes, so it reads only what
// docgen wrote: applying it to a quoted vendor description asks an SDK author
// to edit someone else's specification. A defect is a defect wherever it
// appears, so those rules read everything rendered.
function checkText(source, format = 'md', rejectFile = node_path_1.default.join(PACKAGE, 'qa/styles/config/vocabularies/Docgen/reject.txt'), quoted = []) {
    const text = proseText(source, format), own = authored(source, format, quoted), errors = [];
    const patterns = node_fs_1.default.readFileSync(rejectFile, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
    for (const pattern of patterns)
        if (new RegExp('\\b(?:' + pattern + ')\\b', 'i').test(own))
            errors.push('Avoid: ' + pattern);
    if (/\b(\w+)[ \t]+\1\b/i.test(proseText(source, format, ' \u00b6 ')))
        errors.push('Remove the repeated word');
    if (/—/.test(text))
        errors.push('Use a comma, colon, parentheses, or a new sentence instead of an em dash');
    if (FIRST_PERSON.test(own) || PLURAL_OBJECT.test(own))
        errors.push('Use neutral or second-person prose');
    if (/\p{Extended_Pictographic}/u.test(own))
        errors.push('Do not use emoji in documentation');
    if (/!/.test(own))
        errors.push('Use statements without exclamation marks');
    return errors;
}
function runQA(manifestPath, root = process.cwd(), vale = true) {
    const manifest = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.resolve(root, manifestPath), 'utf8'));
    if (!Array.isArray(manifest.files) || !manifest.files.length)
        throw new Error('Text QA manifest has no documentation files');
    const safe = (p) => {
        const abs = node_path_1.default.resolve(root, p);
        if (abs === root || !abs.startsWith(node_path_1.default.resolve(root) + node_path_1.default.sep))
            throw new Error('QA path escapes the repository: ' + p);
        return abs;
    };
    const config = safe(manifest.config), reject = node_path_1.default.join(node_path_1.default.dirname(config), 'styles/config/vocabularies/Docgen/reject.txt');
    const errors = [], temp = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'docgen-prose-'));
    const quotedFor = (file) => {
        const quoted = manifest.quoted?.[file];
        return Array.isArray(quoted) ? quoted.filter((q) => 'string' === typeof q) : [];
    };
    try {
        const inputs = [];
        for (const [index, file] of manifest.files.entries()) {
            const text = node_fs_1.default.readFileSync(safe(file), 'utf8'), format = file.endsWith('.html') ? 'html' : file.endsWith('.vue') ? 'vue' : 'md';
            errors.push(...checkText(text, format, reject, quotedFor(file)).map(e => file + ': ' + e));
            if (format === 'html') {
                for (const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
                    const url = md.utils.unescapeAll(match[1]);
                    if (/^(?:[a-z]+:|\/\/)/i.test(url))
                        continue;
                    const [target, anchor] = url.split('#');
                    let destination = node_path_1.default.resolve(node_path_1.default.dirname(safe(file)), decodeURIComponent(target.split('?')[0]) || node_path_1.default.basename(file));
                    const route = manifest.routes?.[node_path_1.default.relative(root, destination).split(node_path_1.default.sep).join('/')];
                    if (route)
                        destination = safe(route);
                    if (!destination.startsWith(node_path_1.default.resolve(root) + node_path_1.default.sep) || !node_fs_1.default.existsSync(destination)) {
                        errors.push(file + ': broken local link: ' + url);
                    }
                    else if (anchor && destination.endsWith('.html')) {
                        const document = node_fs_1.default.readFileSync(destination, 'utf8');
                        if (!document.includes('id="' + decodeURIComponent(anchor) + '"'))
                            errors.push(file + ': missing anchor: ' + url);
                    }
                }
            }
            const all = node_path_1.default.join(temp, index + exports.VALE_ALL), own = node_path_1.default.join(temp, index + exports.VALE_OWN);
            node_fs_1.default.writeFileSync(all, (0, exports.valeText)(text, format));
            node_fs_1.default.writeFileSync(own, authored(text, format, quotedFor(file)));
            inputs.push(all, own);
        }
        if (vale) {
            const result = (0, node_child_process_1.spawnSync)('vale', ['--config=' + config, '--minAlertLevel=error', ...inputs], { encoding: 'utf8', cwd: root, maxBuffer: 64 * 1024 * 1024 });
            if (result.error)
                errors.push('Vale is required for text QA: ' + result.error.message);
            else if (result.status !== 0) {
                let output = (result.stdout || '') + (result.stderr || '');
                inputs.forEach((p, i) => { output = output.split(p).join(manifest.files[i >> 1] + (i & 1 ? ' (docgen text)' : '')); });
                errors.push(output);
            }
        }
    }
    finally {
        node_fs_1.default.rmSync(temp, { recursive: true, force: true });
    }
    return { files: manifest.files.length, errors };
}
//# sourceMappingURL=qa.js.map