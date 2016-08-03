import { rebind } from '@zambezi/d3-utils'
import { createSetupGridTemplate } from './setup-grid-template'

export function createGrid() {
  function grid(s) {
    s.text('this is the grid—!').call(createSetupGridTemplate())
  }

  return grid
}
