import {
  cmp, File, Content,
  installCommand, langLabel, packageName, registryState, isPublished,
} from '@voxgig/sdkgen'

import { cell } from './utility_apidocs'


const SdkPage = cmp(function SdkPage(props: any) {
  const { model, target } = props

  File({ name: target.name + '.md' }, () => {
    const lines: string[] = [
      '# ' + (target.title || langLabel(target.name)) + ' SDK',
      '',
      '## Install',
      '',
    ]

    if (isPublished(model, target.name)) {
      lines.push('```bash', installCommand(model, target.name), '```', '')
    }
    else {
      // Not a code block: what `installCommand` returns here is a sentence
      // telling the reader where to get it, and formatting prose as a shell
      // command invites someone to paste it into a terminal.
      lines.push(
        '!!! note',
        '',
        '    This SDK is not published to a registry yet.',
        '    ' + cell(installCommand(model, target.name)),
        '',
      )
    }

    lines.push(
      '| | |',
      '| --- | --- |',
      '| Package | `' + cell(packageName(model, target.name)) + '` |',
      '| Registry | ' + cell(registryState(model, target.name) || '—') + ' |',
      '',
    )

    Content(lines.join('\n'))
  })
})


export {
  SdkPage
}
