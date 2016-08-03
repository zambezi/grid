import { rebind, call } from '@zambezi/d3-utils'
import { createSetupGridTemplate } from './setup-grid-template'
import { compose } from 'underscore'

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , grid = compose(call(setupTemplate))

  return grid
}
