import { test } from 'node:test'
import Assert from 'node:assert/strict'
import { EXAMPLE_LANGUAGES, entityExample, exampleLanguage } from '../dist/examples'

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
    } }
}

// A list under a parent: the parent key is a required point parameter.
function boardList() {
  const param = (n: string) => ({ n, t: '`$STRING`', r: true })
  return { name: 'list', Name: 'List',
    fields: { id: { n: 'id', t: '`$STRING`', r: true }, name: { n: 'name', t: '`$STRING`', r: true } },
    op: {
      load: { name: 'load', points: [{ m: 'GET', o: '/boards/{board_id}/lists/{id}', g: { params: [param('board_id'), param('id')] } }] },
      list: { name: 'list', points: [{ m: 'GET', o: '/boards/{board_id}/lists', g: { params: [param('board_id')] } }] },
    } }
}

test('the languages sdkgen phrases a call in each have a binding', () => {
  Assert.deepEqual([...EXAMPLE_LANGUAGES].sort(), ['go', 'js', 'lua', 'php', 'py', 'rb', 'ts'])
  Assert.equal(exampleLanguage({ name: 'ts' }), 'ts')
  Assert.equal(exampleLanguage({ name: 'partner-ts', origname: 'ts' }), 'ts')
  Assert.equal(exampleLanguage({ name: 'go-mcp' }), undefined)
  Assert.equal(exampleLanguage({ name: 'java' }), undefined)
})

test('only the operations sdkgen generates a method for render, in canonical order', () => {
  Assert.equal(entityExample(pet(), 'ts'), [
    'const pets = await client.Pet().list()',
    'const pet = await client.Pet().load({ id: 1 })',
    'const created = await client.Pet().create({ id: 1, name: "example" })',
    'const updated = await client.Pet().update({ name: "example", tags: [] })',
    'await client.Pet().remove({ id: 1 })',
  ].join('\n'))
  Assert.equal(entityExample(pet(), 'js'), entityExample(pet(), 'ts'))
  Assert.equal(entityExample(pet(), 'py'), [
    'pets = client.Pet().list()',
    'pet = client.Pet().load({"id": 1})',
    'created = client.Pet().create({ "id": 1, "name": "example" })',
    'updated = client.Pet().update({ "name": "example", "tags": [] })',
    'client.Pet().remove({"id": 1})',
  ].join('\n'))
  Assert.equal(entityExample(pet(), 'rb'), [
    'pets = client.Pet.list()',
    'pet = client.Pet.load({ "id" => 1 })',
    'created = client.Pet.create({ "id" => 1, "name" => "example" })',
    'updated = client.Pet.update({ "name" => "example", "tags" => [] })',
    'client.Pet.remove({ "id" => 1 })',
  ].join('\n'))
  Assert.equal(entityExample(pet(), 'php'), [
    '$pets = $client->Pet()->list();',
    '$pet = $client->Pet()->load(["id" => 1]);',
    '$created = $client->Pet()->create(["id" => 1, "name" => "example"]);',
    '$updated = $client->Pet()->update(["name" => "example", "tags" => []]);',
    '$client->Pet()->remove(["id" => 1]);',
  ].join('\n'))
  Assert.equal(entityExample(pet(), 'lua'), [
    'local pets, err = client:Pet():list()',
    'local pet, err = client:Pet():load({ id = 1 })',
    'local created, err = client:Pet():create({ id = 1, name = "example" })',
    'local updated, err = client:Pet():update({ name = "example", tags = {} })',
    'local removed, err = client:Pet():remove({ id = 1 })',
  ].join('\n'))
  const check = 'if err != nil {\n    panic(err)\n}\n'
  Assert.equal(entityExample(pet(), 'go'), [
    'pets, err := client.Pet(nil).List(nil, nil)\n' + check + 'fmt.Println(pets)',
    'pet, err := client.Pet(nil).Load(map[string]any{"id": 1}, nil)\n' + check + 'fmt.Println(pet)',
    'created, err := client.Pet(nil).Create(map[string]any{"id": 1, "name": "example"}, nil)\n' + check + 'fmt.Println(created)',
    'updated, err := client.Pet(nil).Update(map[string]any{"name": "example", "tags": []any{}}, nil)\n' + check + 'fmt.Println(updated)',
    'removed, err := client.Pet(nil).Remove(map[string]any{"id": 1}, nil)\n' + check + 'fmt.Println(removed)',
  ].join('\n'))
  // Neither an inactive op nor `patch` has a generated method to call.
  for (const lang of EXAMPLE_LANGUAGES) {
    Assert.doesNotMatch(entityExample(pet(), lang), /hidden/)
    Assert.doesNotMatch(entityExample(pet(), lang), /[Pp]atch/)
  }
})

test('a nested entity lists and loads with its parent key', () => {
  Assert.equal(entityExample(boardList(), 'ts'), [
    'const lists = await client.List().list({ board_id: "example" })',
    'const list = await client.List().load({ board_id: "example", id: "example_id" })',
  ].join('\n'))
  Assert.equal(entityExample(boardList(), 'go'), [
    'lists, err := client.List(nil).List(map[string]any{"board_id": "example"}, nil)\nif err != nil {\n    panic(err)\n}\nfmt.Println(lists)',
    'list, err := client.List(nil).Load(map[string]any{"board_id": "example", "id": "example_id"}, nil)\nif err != nil {\n    panic(err)\n}\nfmt.Println(list)',
  ].join('\n'))
  Assert.equal(entityExample({ name: 'empty', Name: 'Empty', fields: {}, op: {} }, 'ts'), '')
})
