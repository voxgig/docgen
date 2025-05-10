/* Copyright (c) 2024 Richard Rodger, MIT License */

import * as Fs from 'node:fs'


import * as JostracaModule from 'jostraca'

import { prettyPino, Pino } from '@voxgig/util'

import { Index } from './static/Index'
import { Main } from './static/Main'

// Sample App
import { SampleApp } from './sample_app/SampleApp'

import { PrepareOpenAPI } from './prepare-openapi'

import { ApiDef } from '@voxgig/apidef'


type DocGenOptions = {
  folder: string
  fs: any
  root?: string
  def?: string
  model?: {
    folder: string
    entity: any
  }
  meta?: {
    name: string
  }
  pino?: ReturnType<typeof Pino>
}


const { Jostraca } = JostracaModule


function DocGen(opts: DocGenOptions) {
  const fs = opts.fs || Fs
  const folder = opts.folder || '.'
  // const def = opts.def || 'def.yml'
  const jostraca = Jostraca()

  const pino = prettyPino('sdkgen', opts)
  const log = pino.child({ cmp: 'docgen' })


  async function generate(spec: any) {
    const start = Date.now()
    const { model, config } = spec

    log.info({ point: 'generate-start', start })
    log.debug({ point: 'generate-spec', spec })

    let Root = spec.root

    if (null == Root) {
      clear(config.root)
      const rootModule = require(config.root)
      Root = rootModule.Root
    }

    const opts = { fs, folder, log: log.child({ cmp: 'jostraca' }), meta: { spec } }

    await jostraca.generate(opts, () => Root({ model }))

    log.info({ point: 'generate-end' })
  }


  async function prepare(spec: any, ctx: any) {
    return await PrepareOpenAPI(spec, ctx)
  }


  return {
    generate,
  }

}


DocGen.makeBuild = async function(opts: DocGenOptions) {

  let docgen: any = undefined

  const config: any = {
    root: opts.root,
    def: opts.def || 'no-def',
    kind: 'openapi-3',
    model: opts.model ? (opts.model.folder + '/api.jsonic') : 'no-model',
    meta: opts.meta || {},
    entity: opts.model ? opts.model.entity : undefined,
  }


  return async function build(model: any, build: any) {
    if (null == docgen) {

      docgen = DocGen({
        ...opts,
        pino: build.log,
      })
    }

    // TEMPORARY FIX:  TODO: apidef should be it's own action, same as sdkgen and docgen
    const apidef = ApiDef({
      pino: build.log,
    })

    await apidef.generate(config)

    await docgen.generate({ model, build, config })
  }
}



// Adapted from https://github.com/sindresorhus/import-fresh - Thanks!
function clear(path: string) {
  let filePath = require.resolve(path)

  if (require.cache[filePath]) {
    const children = require.cache[filePath].children.map(child => child.id)

    // Delete module from cache
    delete require.cache[filePath]

    for (const id of children) {
      clear(id)
    }
  }


  if (require.cache[filePath] && require.cache[filePath].parent) {
    let i = require.cache[filePath].parent.children.length

    while (i--) {
      if (require.cache[filePath].parent.children[i].id === filePath) {
        require.cache[filePath].parent.children.splice(i, 1)
      }
    }
  }

}




export type {
  DocGenOptions,
}



type Component = (props: any, children?: any) => void


// Prevents TS2742
export const cmp: (component: Function) => Component = JostracaModule.cmp
export const names: (base: any, name: string, prop?: string) => any = JostracaModule.names
export const each: (subject?: any, apply?: any) => any = JostracaModule.each
export const snakify: (input: any[] | string) => string = JostracaModule.snakify
export const camelify: (input: any[] | string) => string = JostracaModule.camelify
export const kebabify: (input: any[] | string) => string = JostracaModule.kebabify
export const select: (key: any, map: Record<string, Function>) => any = JostracaModule.select
export const cmap: (o: any, p: any) => any = JostracaModule.cmap
export const vmap: (o: any, p: any) => any = JostracaModule.vmap
export const get: (root: any, path: string | string[]) => any = JostracaModule.get
export const getx: (root: any, path: string | string[]) => any = JostracaModule.getx

export const Project: Component = JostracaModule.Project
export const Folder: Component = JostracaModule.Folder
export const File: Component = JostracaModule.File
export const Content: Component = JostracaModule.Content
export const Copy: Component = JostracaModule.Copy
export const Fragment: Component = JostracaModule.Fragment
export const Inject: Component = JostracaModule.Inject


export {
  Index,
  Main,
  SampleApp,

  Jostraca,
  DocGen,
}
