import {
  cmp, File, Content, installCommand, isPublished, langLabel,
} from '@voxgig/sdkgen'

import { cell, entityDesc } from './utility_apidocs'


const IndexPage = cmp(function IndexPage(props: any) {
  const { model, entities, targets } = props

  const info = model?.main?.kit?.info ?? {}
  const name = model.Name || model.name

  File({ name: 'index.md' }, () => {
    const lines: string[] = [
      '# ' + name,
      '',
    ]

    // Spec text, verbatim. It is the API author's sentence, not ours, and
    // CommonMark leaves whatever it contains alone.
    if ('' !== String(info.summary ?? '')) {
      lines.push(String(info.summary).trim(), '')
    }

    if (0 < targets.length) {
      lines.push(
        '## SDKs',
        '',
        '| Language | Install |',
        '| --- | --- |',
      )

      for (const target of targets) {
        // `installCommand` returns GUIDANCE, not a command, for a target
        // that is not on a registry yet ("install from the git tag: …") —
        // a whole sentence, which in a table cell inside backticks reads as
        // a command nobody can run. The SDK's own page has room to explain;
        // the table just says so.
        const install = isPublished(model, target.name) ?
          '`' + cell(installCommand(model, target.name)) + '`' :
          'not published — [see the page](sdks/' + target.name + '.md)'

        lines.push('| [' + cell(langLabel(target.name)) + '](sdks/' +
          target.name + '.md) | ' + install + ' |')
      }

      lines.push('')
    }

    if (0 < entities.length) {
      lines.push('## API', '')

      for (const entity of entities) {
        const desc = entityDesc(model, entity)
        lines.push('- [' + (entity.Name || entity.name) + '](api/' +
          entity.name + '.md)' + ('' === desc ? '' : ' — ' + cell(desc)))
      }

      lines.push('')
    }

    Content(lines.join('\n'))
  })
})


export {
  IndexPage
}
