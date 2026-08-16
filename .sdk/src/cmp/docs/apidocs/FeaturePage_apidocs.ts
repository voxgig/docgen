import { cmp, File, Content } from '@voxgig/sdkgen'

import { cell } from './utility_apidocs'


const FeaturePage = cmp(function FeaturePage(props: any) {
  const { feature } = props

  File({ name: feature.name + '.md' }, () => {
    const hooks = Object.keys(feature.hook ?? {})
      .filter((h: string) => true === feature.hook[h]?.active)
      .sort()

    const lines: string[] = [
      '# ' + (feature.title || feature.name),
      '',
      'Enable it per SDK with `options.feature.' + feature.name +
      '.active = true`.',
      '',
      '```json',
      '{ "feature": { "' + feature.name + '": { "active": true } } }',
      '```',
      '',
    ]

    if (0 < hooks.length) {
      lines.push(
        '## Pipeline stages',
        '',
        'This feature runs at:',
        '',
        ...hooks.map((h: string) => '- `' + cell(h) + '`'),
        '',
      )
    }

    Content(lines.join('\n'))
  })
})


export {
  FeaturePage
}
