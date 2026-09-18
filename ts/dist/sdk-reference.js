"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleValues = exampleValues;
exports.setupExample = setupExample;
exports.toolContracts = toolContracts;
exports.clientDefaults = clientDefaults;
const jostraca_1 = require("jostraca");
const sdkgen_1 = require("@voxgig/sdkgen");
// Documentation adapters describe each installed surface without importing its
// README components. A project can replace examples through main.kit.doc.target.
function exampleValues(model, target) {
    const n = {};
    (0, jostraca_1.names)(n, model.name);
    return { Name: n.Name, name: model.name, lower: String(n.Name).toLowerCase(),
        env: String(model.name).replace(/[^a-z0-9]+/gi, '_').toUpperCase() + '_APIKEY',
        package: (0, sdkgen_1.packageName)(model, target.name), goModule: (0, sdkgen_1.goModule)(model, target.name),
        pyModule: model.name.replace(/-/g, '_') + '_sdk' };
}
function setupExample(model, target, templates) {
    const detail = model.main.kit.doc?.target?.[target.name];
    if (detail?.example)
        return detail.example;
    const source = templates[target.origname || target.name];
    if (!source)
        return '';
    const values = exampleValues(model, target);
    return source.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (!(key in values))
            throw new Error('Unknown SDK example template slot: ' + key);
        return values[key];
    });
}
function toolContracts(model, target, entities) {
    const defined = model.main.kit.doc?.target?.[target.name]?.tool;
    if (defined && Object.keys(defined).length)
        return Object.keys(defined).sort().map(name => ({ name, ...defined[name] }));
    if ((target.origname || target.name) !== 'go-mcp')
        return [];
    return ['list', 'load'].map(op => ({ name: model.name.toLowerCase() + '_' + op,
        description: op === 'list' ? 'List records for an entity.' : 'Load one record for an entity.',
        operation: op,
        supportedEntities: entities.filter(e => e.op?.[op] && e.op[op].active !== false).map(e => e.name),
        input: { type: 'object', required: ['entity'], properties: {
                entity: { type: 'string', description: entities.map(e => e.name).join(' | ') },
                query: { type: 'object', description: 'Optional match fields for the selected entity.' }
            } } }));
}
function clientDefaults(model, target) {
    const identity = {};
    (0, jostraca_1.names)(identity, model.name);
    const kit = model.main.kit;
    const normalised = { ...model, const: identity,
        main: { ...model.main, kit: { ...kit, config: { headers: {}, ...kit.config } } } };
    return (0, sdkgen_1.configDefinition)(normalised, target.name).def.options;
}
//# sourceMappingURL=sdk-reference.js.map