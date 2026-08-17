"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.requirePath = exports.resolvePath = void 0;
const node_path_1 = __importDefault(require("node:path"));
// TODO: move to @voxgig/util as duplicated with @voxgig/sdkgen
const resolvePath = (ctx$, path) => {
    const fullpath = node_path_1.default.join(ctx$.folder, '..', 'dist', path);
    return fullpath;
};
exports.resolvePath = resolvePath;
const requirePath = (ctx$, path, flags) => {
    const fullpath = resolvePath(ctx$, path);
    const ignore = null == flags?.ignore ? false : flags.ignore;
    try {
        return require(fullpath);
    }
    catch (err) {
        if (ignore) {
            ctx$.log.warn({ point: 'require-missing', path, note: path });
        }
        else {
            throw err;
        }
    }
};
exports.requirePath = requirePath;
// VENDORED from jostraca, which removed `select` in 0.33.
//
// This package re-exports it as part of its own public API, and pinning an
// older jostraca to keep one four-line function would hold the entire
// dependency tree back — so it lives here instead. The body is jostraca
// 0.19's, semantics unchanged.
//
// A MISSING KEY IS NOT AN ERROR, and that is the point of the helper: it
// branches on a model value where most keys have no case, so throwing would
// turn "nothing to emit here" into a failed generate.
const select = (key, map) => {
    const fn = map && map[key];
    return fn ? fn() : undefined;
};
exports.select = select;
//# sourceMappingURL=utility.js.map