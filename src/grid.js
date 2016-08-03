import { compose } from 'underscore'
import { createSetupGridTemplate } from './setup-grid-template'
import { ensureData } from './ensure-data'
import { ensureId } from './ensure-id'
import { rebind, call, each } from '@zambezi/d3-utils'

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , grid = compose(
          each(console.log.bind(console, 'grid drawn'))
        , call(setupTemplate)
        , each(ensureData)
        , each(ensureId)
        )
      , api = rebind()
            .from(setupTemplate, 'template')

  return api(grid)
}
