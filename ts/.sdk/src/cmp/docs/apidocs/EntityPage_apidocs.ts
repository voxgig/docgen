import { cmp, File, Content, entityPath } from '@voxgig/sdkgen'

import { cell, entityDesc, opNames } from './utility_apidocs'


const EntityPage = cmp(function EntityPage(props: any) {
  const { model, entity } = props

  File({ name: entity.name + '.md' }, () => {
    const lines: string[] = [
      '# ' + (entity.Name || entity.name),
      '',
    ]

    const desc = entityDesc(model, entity)

    if ('' !== desc) {
      lines.push(desc, '')
    }

    const ops = opNames(entity)

    if (0 < ops.length) {
      lines.push(
        '## Operations',
        '',
        '| Operation | Method | Path |',
        '| --- | --- | --- |',
      )

      for (const opname of ops) {
        const op = entity.op[opname] ?? {}
        const point = (op.points ?? [])[0] ?? {}

        lines.push('| `' + cell(opname) + '` | ' +
          ('' === cell(point.method) ? '—' : '`' + cell(point.method) + '`') +
          ' | ' +
          ('' === cell(point.orig) ? '—' : '`' + cell(point.orig) + '`') + ' |')
      }

      lines.push('')
    }

    Content(lines.join('\n'))
  })
})


export {
  EntityPage
}
