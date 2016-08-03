import { calculateColumnLayout } from './calculate-column-layout'
import { compose } from 'underscore'
import { createEnsureColumns } from './ensure-columns'
import { createSetupGridTemplate } from './setup-grid-template'
import { ensureData } from './ensure-data'
import { ensureId } from './ensure-id'
import { rebind, call, each } from '@zambezi/d3-utils'
import { createProcessRowData } from './process-row-data'
import { createMarkRowIndices } from './mark-row-indices'

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , ensureColumns = createEnsureColumns()
      , processRowData = createProcessRowData()
      , grid = compose(
          each(console.log.bind(console, 'grid drawn'))
        , call(createMarkRowIndices())
        , call(processRowData)
        , call(setupTemplate)
        , each(calculateColumnLayout)
        , call(ensureColumns)
        , each(ensureData)
        , each(ensureId)
        )
      , api = rebind()
            .from(setupTemplate, 'template')
            .from(ensureColumns, 'columns')
            .from(processRowData, 'filters', 'filtersUse', 'skipRowLocking')

  return api(grid)
}
