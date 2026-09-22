"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const examples_1 = require("../dist/examples");
function pet() {
    return { name: 'pet', Name: 'Pet',
        fields: { id: { n: 'id', h: 'Id', t: 'number', r: true }, name: { n: 'name', t: '`$STRING`', r: true }, tags: { n: 'tags', t: '`$ARRAY`', r: false } },
        op: {
            load: { name: 'load', points: [{ m: 'GET', o: '/pets/{id}' }] },
            list: { name: 'list', points: [{ m: 'GET', o: '/pets' }] },
            create: { name: 'create', points: [{ m: 'POST', o: '/pets' }] },
            update: { name: 'update', points: [{ m: 'PUT', o: '/pets/{id}' }] },
            remove: { name: 'remove', points: [{ m: 'DELETE', o: '/pets/{id}' }] },
            // apidef emits `patch` for an item route declaring both PUT and PATCH.
            patch: { name: 'patch', points: [{ m: 'PATCH', o: '/pets/{id}' }] },
            hidden: { name: 'hidden', active: false, points: [{ m: 'GET', o: '/pets/hidden' }] },
        } };
}
// A list under a parent: the parent key is a required point parameter.
function boardList() {
    const param = (n) => ({ n, t: '`$STRING`', r: true });
    return { name: 'list', Name: 'List',
        fields: { id: { n: 'id', t: '`$STRING`', r: true }, name: { n: 'name', t: '`$STRING`', r: true } },
        op: {
            load: { name: 'load', points: [{ m: 'GET', o: '/boards/{board_id}/lists/{id}', g: { params: [param('board_id'), param('id')] } }] },
            list: { name: 'list', points: [{ m: 'GET', o: '/boards/{board_id}/lists', g: { params: [param('board_id')] } }] },
        } };
}
(0, node_test_1.test)('the languages sdkgen phrases a call in each have a binding', () => {
    strict_1.default.deepEqual([...examples_1.EXAMPLE_LANGUAGES].sort(), ['go', 'js', 'lua', 'php', 'py', 'rb', 'ts']);
    strict_1.default.equal((0, examples_1.exampleLanguage)({ name: 'ts' }), 'ts');
    strict_1.default.equal((0, examples_1.exampleLanguage)({ name: 'partner-ts', origname: 'ts' }), 'ts');
    strict_1.default.equal((0, examples_1.exampleLanguage)({ name: 'go-mcp' }), undefined);
    strict_1.default.equal((0, examples_1.exampleLanguage)({ name: 'java' }), undefined);
});
(0, node_test_1.test)('only the operations sdkgen generates a method for render, in canonical order', () => {
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'ts'), [
        'const pets = await client.Pet().list()',
        'const pet = await client.Pet().load({ id: 1 })',
        'const created = await client.Pet().create({ id: 1, name: "example" })',
        'const updated = await client.Pet().update({ name: "example", tags: [] })',
        'await client.Pet().remove({ id: 1 })',
    ].join('\n'));
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'js'), (0, examples_1.entityExample)(pet(), 'ts'));
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'py'), [
        'pets = client.Pet().list()',
        'pet = client.Pet().load({"id": 1})',
        'created = client.Pet().create({ "id": 1, "name": "example" })',
        'updated = client.Pet().update({ "name": "example", "tags": [] })',
        'client.Pet().remove({"id": 1})',
    ].join('\n'));
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'rb'), [
        'pets = client.Pet.list()',
        'pet = client.Pet.load({ "id" => 1 })',
        'created = client.Pet.create({ "id" => 1, "name" => "example" })',
        'updated = client.Pet.update({ "name" => "example", "tags" => [] })',
        'client.Pet.remove({ "id" => 1 })',
    ].join('\n'));
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'php'), [
        '$pets = $client->Pet()->list();',
        '$pet = $client->Pet()->load(["id" => 1]);',
        '$created = $client->Pet()->create(["id" => 1, "name" => "example"]);',
        '$updated = $client->Pet()->update(["name" => "example", "tags" => []]);',
        '$client->Pet()->remove(["id" => 1]);',
    ].join('\n'));
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'lua'), [
        'local pets, err = client:Pet():list()',
        'local pet, err = client:Pet():load({ id = 1 })',
        'local created, err = client:Pet():create({ id = 1, name = "example" })',
        'local updated, err = client:Pet():update({ name = "example", tags = {} })',
        'local removed, err = client:Pet():remove({ id = 1 })',
    ].join('\n'));
    const check = 'if err != nil {\n    panic(err)\n}\n';
    strict_1.default.equal((0, examples_1.entityExample)(pet(), 'go'), [
        'pets, err := client.Pet(nil).List(nil, nil)\n' + check + 'fmt.Println(pets)',
        'pet, err := client.Pet(nil).Load(map[string]any{"id": 1}, nil)\n' + check + 'fmt.Println(pet)',
        'created, err := client.Pet(nil).Create(map[string]any{"id": 1, "name": "example"}, nil)\n' + check + 'fmt.Println(created)',
        'updated, err := client.Pet(nil).Update(map[string]any{"name": "example", "tags": []any{}}, nil)\n' + check + 'fmt.Println(updated)',
        'removed, err := client.Pet(nil).Remove(map[string]any{"id": 1}, nil)\n' + check + 'fmt.Println(removed)',
    ].join('\n'));
    // Neither an inactive op nor `patch` has a generated method to call.
    for (const lang of examples_1.EXAMPLE_LANGUAGES) {
        strict_1.default.doesNotMatch((0, examples_1.entityExample)(pet(), lang), /hidden/);
        strict_1.default.doesNotMatch((0, examples_1.entityExample)(pet(), lang), /[Pp]atch/);
    }
});
(0, node_test_1.test)('a nested entity lists and loads with its parent key', () => {
    strict_1.default.equal((0, examples_1.entityExample)(boardList(), 'ts'), [
        'const lists = await client.List().list({ board_id: "example" })',
        'const list = await client.List().load({ board_id: "example", id: "example_id" })',
    ].join('\n'));
    strict_1.default.equal((0, examples_1.entityExample)(boardList(), 'go'), [
        'lists, err := client.List(nil).List(map[string]any{"board_id": "example"}, nil)\nif err != nil {\n    panic(err)\n}\nfmt.Println(lists)',
        'list, err := client.List(nil).Load(map[string]any{"board_id": "example", "id": "example_id"}, nil)\nif err != nil {\n    panic(err)\n}\nfmt.Println(list)',
    ].join('\n'));
    strict_1.default.equal((0, examples_1.entityExample)({ name: 'empty', Name: 'Empty', fields: {}, op: {} }, 'ts'), '');
});
//# sourceMappingURL=examples.test.js.map