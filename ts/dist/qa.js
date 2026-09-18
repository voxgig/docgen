"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
function proseText(source, format = 'md') {
    if (format === 'html' || format === 'vue') {
        if (format === 'vue')
            source = source.replace(/\{\{[^]*?\}\}/g, ' ');
        source = source.replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
            .replace(/<!--[^]*?-->/g, '').replace(/<\/(?:p|h[1-6]|li|tr|td|th|div|nav|header|main|summary|details|footer|aside|span)>/gi, '\n\n').replace(/<[^>]+>/g, ' ');
        return stripUrls(md.utils.unescapeAll(source)).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    source = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/<!--[\s\S]*?-->/g, '');
    const collect = (tokens) => tokens.map(t => {
        if (['fence', 'code_block', 'code_inline', 'html_block', 'html_inline'].includes(t.type))
            return '';
        if (t.children)
            return collect(t.children);
        return t.type === 'text' ? md.utils.unescapeAll(t.content) : t.type.endsWith('_close') ? '\n\n' : ' ';
    }).join(' ');
    return stripUrls(collect(md.parse(source, {}))).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function authored(source, format) {
    const stripped = 'html' === format || 'vue' === format
        ? source.replace(/<td\b[^>]*>[\s\S]*?<\/td>/gi, ' ')
        : source.split('\n').filter(line => !/^\s*\|/.test(line)).join('\n');
    return proseText(stripped, format);
}
function checkText(source, format = 'md', rejectFile = node_path_1.default.join(PACKAGE, 'qa/styles/config/vocabularies/Docgen/reject.txt')) {
    const text = proseText(source, format), errors = [];
    const patterns = node_fs_1.default.readFileSync(rejectFile, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));
    for (const pattern of patterns)
        if (new RegExp('\\b(?:' + pattern + ')\\b', 'i').test(text))
            errors.push('Avoid: ' + pattern);
    if (/\b(\w+)[ \t]+\1\b/i.test(text))
        errors.push('Remove the repeated word');
    if (/—/.test(text))
        errors.push('Use a comma, colon, parentheses, or a new sentence instead of an em dash');
    if (/\b(I|me|my|mine|we|us|our|ours)\b/i.test(authored(source, format)))
        errors.push('Use neutral or second-person prose');
    if (/\p{Extended_Pictographic}/u.test(text))
        errors.push('Do not use emoji in documentation');
    if (/!/.test(text))
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
    try {
        const inputs = [];
        for (const [index, file] of manifest.files.entries()) {
            const text = node_fs_1.default.readFileSync(safe(file), 'utf8'), format = file.endsWith('.html') ? 'html' : file.endsWith('.vue') ? 'vue' : 'md';
            errors.push(...checkText(text, format, reject).map(e => file + ': ' + e));
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
            const dest = node_path_1.default.join(temp, index + '.txt');
            node_fs_1.default.writeFileSync(dest, authored(text, format));
            inputs.push(dest);
        }
        if (vale) {
            const result = (0, node_child_process_1.spawnSync)('vale', ['--config=' + config, '--minAlertLevel=error', ...inputs], { encoding: 'utf8', cwd: root, maxBuffer: 64 * 1024 * 1024 });
            if (result.error)
                errors.push('Vale is required for text QA: ' + result.error.message);
            else if (result.status !== 0) {
                let output = (result.stdout || '') + (result.stderr || '');
                inputs.forEach((p, i) => { output = output.split(p).join(manifest.files[i]); });
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