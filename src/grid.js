import { rebind, call, each } from '@zambezi/d3-utils'
import { createSetupGridTemplate } from './setup-grid-template'
import { ensureId } from './ensure-id'
import { compose } from 'underscore'

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , grid = compose(
          call(setupTemplate)
        , each(ensureId)
        )

  return grid
}
