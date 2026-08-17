

import Path from 'node:path'


// TODO: move to @voxgig/util as duplicated with @voxgig/sdkgen

const resolvePath = (ctx$: any, path: string): any => {
  const fullpath = Path.join(ctx$.folder, '..', 'dist', path)
  return fullpath
}


const requirePath = (ctx$: any, path: string, flags?: { ignore?: boolean }): any => {
  const fullpath = resolvePath(ctx$, path)
  const ignore = null == flags?.ignore ? false : flags.ignore

  try {
    return require(fullpath)
  }
  catch (err: any) {
    if (ignore) {
      ctx$.log.warn({ point: 'require-missing', path, note: path })
    }
    else {
      throw err
    }
  }
}



// VENDORED from jostraca, which removed `select` in 0.33.
//
// This package re-exports it as part of its own public API, and pinning an
// older jostraca to keep one four-line function would hold the entire
// dependency tree back — so it lives here instead. The body is jostraca
// 0.19's, semantics unchanged.
//
// A MISSING KEY IS NOT AN ERROR, and that is the point of the helper: it
// branches on a model value where most keys have no case, so throwing would
// turn "nothing to emit here" into a failed generate.
const select = (key: any, map: Record<string, Function>): any => {
  const fn = map && map[key]
  return fn ? fn() : undefined
}


export {
  resolvePath,
  requirePath,
  select,
}

