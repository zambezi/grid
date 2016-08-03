import { compose } from 'underscore'
import { createSetupGridTemplate } from './setup-grid-template'
import { ensureData } from './ensure-data'
import { ensureId } from './ensure-id'
import { createEnsureColumns } from './ensure-columns'
import { rebind, call, each } from '@zambezi/d3-utils'

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , ensureColumns = createEnsureColumns()
      , grid = compose(
          each(console.log.bind(console, 'grid drawn'))
        , call(setupTemplate)
        , call(ensureColumns)
        , each(ensureData)
        , each(ensureId)
        )
      , api = rebind()
            .from(setupTemplate, 'template')
            .from(ensureColumns, 'columns')

  return api(grid)
}
