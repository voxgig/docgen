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
    return lang in BINDING ? lang : undefined;
}
const RESULT_NAME = { create: 'created', update: 'updated', remove: 'removed' };
function resultName(lang, op, entityVar) {
    if ('list' === op)
        return entityVar + 's';
    if ('load' === op)
        return entityVar;
    if (RESULT_NAME[op])
        return RESULT_NAME[op];
    return 'py' === lang || 'rb' === lang ? entityVar + '_' + op : entityVar + op.charAt(0).toUpperCase() + op.slice(1);
}
function entityExample(entity, lang) {
    const idF = (0, sdkgen_1.entityIdField)(entity), entityVar = (0, sdkgen_1.exampleVarName)(entity.name, lang);
    return (0, sdkgen_1.entityOps)(entity).map(op => {
        const call = (0, sdkgen_1.primaryOpCall)(lang, entity.Name, entityVar, op, idF, entity);
        if ('list' === op) {
            // primaryOpCall lists without a match; a nested entity's list still
            // needs its parent keys, which matchArg carries for every language.
            const match = (0, sdkgen_1.matchArg)(lang, entity, op, idF, (0, sdkgen_1.idLiteral)(entity, op, idF));
            if (match && 'nil' !== match)
                call.expr = call.expr.replace(/\((?:nil, nil)?\)$/, '(' + match + ('go' === lang ? ', nil' : '') + ')');
        }
        return BINDING[lang]({ ...call, resultVar: resultName(lang, op, entityVar) });
    }).join('\n');
}
//# sourceMappingURL=examples.js.map