
import { each, Content } from 'jostraca'

export const languagesSpec: Record<string, any> = {
  js: {
    Name: "JavaScript",
    name: "javascript",
    install: (model: any) => `npm install ${model.name}-sdk`,
    init: (model: any, option: any) => {
      Content(`
  const client = ${model.Name}SDK.make({`)
      each(option, (opt: any) => {
        if (opt.kind == "String") {
          Content(`
    ${opt.name}: process.env.${model.NAME}_${opt.name.toUpperCase()},`)
        }
      })
      Content(`
  })`)
    },
    create: (op: any, entity: any) => Content(`
  ${entity.name} = await client.${entity.Name}().${op.name}({
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
               `),
    save: (op: any, entity: any) => Content(`
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1,
    baa: "foo",
  })

  console.log('${entity.Name}', ${entity.name})
               `),
    load: (op: any, entity: any) => Content(`
  ${entity.name} = await client.${entity.Name}().${op.name}({
    id: 1
  })

  console.log('${entity.Name}', ${entity.name})
               `),
    remove: (op: any, entity: any) => Content(`
  await client.${entity.Name}().${op.name}({
    id: 1
  })
               `),
    list: (op: any, entity: any) => Content(`
  ${entity.name} = await client.${entity.Name}().${op.name}()
  console.log('${entity.Name}', ${entity.name})
               `),
  },
  go: {
    Name: "Go",
    name: "go",
    install: (model: any) => `go get ${model.name}`,
    init: (model: any, option: any) => {
      Content(`
  options := ${model.name}sdk.Options{`)
      each(option, (opt: any) => {
        if (opt.kind == "String") {
          const capName = opt.name.charAt(0).toUpperCase() + opt.name.substring(1, opt.name.length);
          Content(`
    ${capName}: os.Getenv("${model.NAME}_${opt.name.toUpperCase()}"),`)
        }
      })
      Content(`
  }`)
    },
    create: (op: any, entity: any) => Content(`
  data := ${entity.Name}Data{
    Baa: "foo"
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(data)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
               `),
    save: (op: any, entity: any) => Content(`
  data := ${entity.Name}Data{
    Id: 1,
    Baa: "foo",
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(data)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
               `),
    load: (op: any, entity: any) => Content(`
  query := Query{
    Id: 1
  }

  ${entity.name}, err := client.${entity.Name}().${op.Name}(query)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }

  fmt.Printf("${entity.Name} %+v\\n", ${entity.name})
               `),
    remove: (op: any, entity: any) => Content(`
  query := Query{
    Id: 1
  }

  _, err := client.${entity.Name}().${op.Name}(query)
  if err != nil {
    fmt.Println("Error running ${entity.Name} ${op.Name}:", err)
    return
  }
               `),
    list: (op: any, entity: any) => Content(`
  ${entity.name}, err := client.${entity.Name}().${op.Name}()
  if err != nil {
    log.Println("Error running ${entity.name} ${op.Name}:", err)
    return
  }

  log.Printf("${entity.Name} %+v\\n", ${entity.name})
               `),
  },
  py: {
    Name: "Python",
    name: "python",
    install: (model: any) => `pip3 install ${model.name}_sdk`,
    init: (model: any, option: any) => {
      Content(`
  client = ${model.Name}SDK.make((`)
      each(option, (opt: any) => {
        if (opt.kind == "String") {
          Content(`
    ${opt.name}: environ['${model.NAME}_${opt.name.toUpperCase()}'],`)
        }
      })
      Content(`
  ))`)
    },
    create: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    baa: "foo",
  ))

  print('${entity.Name}', ${entity.name})
               `),
    save: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}().${op.name}(Data(
    id = 1,
    baa = "foo",
  ))

  print('${entity.Name}', ${entity.name})
               `),
    load: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}().${op.name}({
    "id": 1
  })

  print('${entity.Name}', ${entity.name})
               `),
    remove: (op: any, entity: any) => Content(`
 client.${entity.Name}().${op.name}({
    "id": 1
  })
               `),
    list: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}().${op.name}()
  print('${entity.Name}', ${entity.name})
               `),
  },
  php: {
    Name: "PHP",
    name: "php",
    install: (model: any) => `composer install ${model.name}-sdk`,
    init: (model: any, option: any) => {
      Content(`
  $client = ${model.Name}SDK([ `)
      each(option, (opt: any) => {
        if (opt.kind == "String") {
          Content(`
    '${opt.name}' => getenv('${model.NAME}_${opt.name.toUpperCase()}'),`)
        }
      })
      Content(`
  ]);`)
    },
    create: (op: any, entity: any) => Content(`
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
               `),
    save: (op: any, entity: any) => Content(`
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    'id' => 1,
    'baa' => "foo",
  ]);

  print_r("${entity.Name} " . $${entity.name});
               `),
    load: (op: any, entity: any) => Content(`
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}([
    "id" => 1
  ]);

  print_r("${entity.Name} " . $${entity.name});
               `),
    remove: (op: any, entity: any) => Content(`
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name}->${op.name}([
    "id" => 1
  ]);
               `),
    list: (op: any, entity: any) => Content(`
  $${entity.name} = new ${entity.Name}($client);
  $${entity.name} = $${entity.name}->${op.name}();
  print_r("${entity.Name} " . $${entity.name});
               `),
  },
  rb: {
    Name: "Ruby",
    name: "ruby",
    install: (model: any) => `gem install ${model.name}-sdk`,
    init: (model: any, option: any) => {
      Content(`
  const client = ${model.Name}SDK.new({`)
      each(option, (opt: any) => {
        if (opt.kind == "String") {
          const capName = opt.name.charAt(0).toUpperCase() + opt.name.substring(1, opt.name.length);
          Content(`
    ${capName}: ENV['${model.NAME}_${opt.name.toUpperCase()}'],`)
        }
      })
      Content(`
  }`)
    },
    create: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}.${op.name}({
    baa: "foo"
  })

  puts "${entity.Name} #{${entity.name}}"
               `),
    save: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1,
    baa: "foo",
  })

  puts "${entity.Name} #{${entity.name}}"
               `),
    load: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}.${op.name}({
    id: 1
  })

  puts "${entity.Name} #{${entity.name}}"
               `),
  remove: (op: any, entity: any) => Content(`
  client.${entity.Name}.${op.name}({
    id: 1
  })

               `),
    list: (op: any, entity: any) => Content(`
  ${entity.name} = client.${entity.Name}.${op.name}()
  puts "${entity.Name} #{${entity.name}}"
               `),
  },
}
