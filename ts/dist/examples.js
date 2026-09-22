"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXAMPLE_LANGUAGES = void 0;
exports.exampleLanguage = exampleLanguage;
exports.entityExample = entityExample;
const sdkgen_1 = require("@voxgig/sdkgen");
// How each language binds a call's result. The call itself is sdkgen's
// primaryOpCall, the phrasing the generated README uses, so the reference
// and the README cannot drift. See docs/design/entity-examples.md
const BINDING = {
    ts: c => (c.isVoid ? 'await ' : 'const ' + c.resultVar + ' = await ') + c.expr,
    js: c => (c.isVoid ? 'await ' : 'const ' + c.resultVar + ' = await ') + c.expr,
    py: c => (c.isVoid ? '' : c.resultVar + ' = ') + c.expr,
    rb: c => (c.isVoid ? '' : c.resultVar + ' = ') + c.expr,
    php: c => (c.isVoid ? '' : '$' + c.resultVar + ' = ') + c.expr + ';',
    lua: c => 'local ' + c.resultVar + ', err = ' + c.expr,
    // Go rejects an unused variable, so every result is printed.
    go: c => c.resultVar + ', err := ' + c.expr + '\nif err != nil {\n    panic(err)\n}\nfmt.Println(' + c.resultVar + ')',
};
exports.EXAMPLE_LANGUAGES = Object.keys(BINDING);
function exampleLanguage(target) {
    const lang = target?.origname || target?.name;
    return Object.hasOwn(BINDING, lang) ? lang : undefined;
}
const RESULT_NAME = { create: 'created', update: 'updated', remove: 'removed' };
function resultName(op, entityVar) {
    if ('list' === op)
        return entityVar + 's';
    if ('load' === op)
        return entityVar;
    return RESULT_NAME[op];
}
// apidef emits `patch` as its own op, which no SDK has a method for:
// sdkgen's `OP_SUFFIX` keys the ops its Entity components generate.
function methodOps(entity) {
    return (0, sdkgen_1.entityOps)(entity).filter(op => Object.hasOwn(sdkgen_1.OP_SUFFIX, op));
}
function paramsView(op, items) {
    return { op: { [op]: { points: [{ g: { params: items.map(it => ({ n: it.name, t: it.type, r: true })) } }] } } };
}
// dataArg keeps only the required items, which on an apidef model is the id
// alone; the items chosen here go back to sdkgen as params, for its literals.
function updateArg(lang, entity, idF, idLit) {
    const items = (0, sdkgen_1.opRequestShape)(entity, 'update').items;
    const own = items.filter(it => it.name !== idF && it.name !== 'id');
    const required = own.filter(it => !it.optional);
    const fields = required.concat(own.filter(it => it.optional)).slice(0, Math.max(2, required.length));
    const id = null == idF ? [] : [items.find(it => it.name === idF) ?? { name: idF, type: null }];
    return (0, sdkgen_1.matchArg)(lang, paramsView('update', id.concat(fields)), 'update', idF, idLit);
}
function withArg(lang, expr, arg) {
    return expr.replace(/\([^()]*\)$/, '(' + arg + ('go' === lang ? ', nil' : '') + ')');
}
function entityExample(entity, lang) {
    const idF = (0, sdkgen_1.entityIdField)(entity), entityVar = (0, sdkgen_1.exampleVarName)(entity.name, lang);
    return methodOps(entity).map(op => {
        const call = (0, sdkgen_1.primaryOpCall)(lang, entity.Name, entityVar, op, idF, entity);
        const idLit = (0, sdkgen_1.idLiteral)(entity, op, idF);
        const arg = 'list' === op ? (0, sdkgen_1.matchArg)(lang, entity, op, idF, idLit) :
            'update' === op ? updateArg(lang, entity, idF, idLit) : '';
        if (arg && 'nil' !== arg)
            call.expr = withArg(lang, call.expr, arg);
        return BINDING[lang]({ ...call, resultVar: resultName(op, entityVar) });
    }).join('\n');
}
//# sourceMappingURL=examples.js.map