// apidocs — a static documentation site for an API and the SDKs generated
// from it, emitted as mkdocs-material.
//
// DISPATCH: `cmp/docs/<n>/Main_<n>`, the same convention a language target
// follows. @voxgig/sdkgen calls this; everything it emits is this package's.
//
// WHAT IS GENERATED AND WHAT IS TEMPLATED
//
// The same rule the SDK targets follow: same for every API -> template
// (`tm/docs/apidocs`, copied verbatim); depends on the API -> generated here.
//
// `mkdocs.yml` is GENERATED rather than templated, and that is not an
// accident: its `nav` names every page by path, so a templated one would go
// stale the moment an entity is added or an SDK installed. It is the same
// reason rust's `feature/mod.rs` is emitted from the model.
//
// SPEC TEXT IS NOT OURS
//
// `info.summary`, entity descriptions and operation summaries come from the
// API's own OpenAPI document. They are interpolated into prose here, which is
// safe under CommonMark and would not be under MDX — see the note in
// `model/docs/apidocs.aontu`.

import {
  cmp, Folder, Copy,
  entityCollection,
} from '@voxgig/sdkgen'

import { Nav } from './Nav_apidocs'
import { IndexPage } from './IndexPage_apidocs'
import { EntityPage } from './EntityPage_apidocs'
import { SdkPage } from './SdkPage_apidocs'
import { FeaturePage } from './FeaturePage_apidocs'

import {
  activeEntities, activeTargets, activeFeatures,
} from './utility_apidocs'


const Main = cmp(function Main(props: any) {
  const { model, docs } = props
  const ctx$ = props.ctx$

  // A COLLECTION keyed by name, not an array — `entityCollection(model)`
  // returns the model node. Reading `.length` off it silently yields
  // undefined, so every entity page was skipped and the site generated
  // without an API section at all. Flattened once, here.
  const entities = activeEntities(model)
  const targets = activeTargets(model)
  const features = activeFeatures(model)

  ctx$.log.info({
    point: 'apidocs-build', docs: docs.name,
    entities: entities.length, targets: targets.length,
    features: features.length,
    note: docs.name + ': ' + entities.length + ' entities, ' +
      targets.length + ' SDKs, ' + features.length + ' features'
  })

  // The site scaffold: everything that is the same for every API — the
  // dependency pin, the Makefile, the theme overrides.
  Copy({ from: 'tm/docs/' + docs.name, exclude: [/mkdocs\.yml$/] })

  Nav({ model, docs, entities, targets, features })

  Folder({ name: 'docs' }, () => {
    IndexPage({ model, docs, entities, targets })

    if (0 < entities.length) {
      Folder({ name: 'api' }, () => {
        for (const entity of entities) {
          EntityPage({ model, entity, targets })
        }
      })
    }

    if (0 < targets.length) {
      Folder({ name: 'sdks' }, () => {
        for (const target of targets) {
          SdkPage({ model, target })
        }
      })
    }

    if (0 < features.length) {
      Folder({ name: 'features' }, () => {
        for (const feature of features) {
          FeaturePage({ model, feature, targets })
        }
      })
    }
  })
})


export {
  Main
}
