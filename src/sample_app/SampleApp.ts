
import { cmp, each, File, Folder, Content, Fragment, Copy } from 'jostraca'


import { Server } from './Server'



const SampleApp = cmp(function SampleApp(props: any) {
  const { ctx$ } = props
  const { model } = ctx$
  
  Folder({ name: 'sampleapp' }, () => {
    Server(props)
  })

})


export {
  SampleApp
}
