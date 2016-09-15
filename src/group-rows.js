import { createGroupRowsLayout } from './group-rows-layout'
import { rebind } from '@zambezi/d3-utils'

import './group-rows.css'

export function createGroupRows() {
  
  const layout = createGroupRowsLayout()

  function groupRows(s) {
    s.each(groupRowsEach)
  }

  return rebind().from(layout, 'groupings')(groupRows)

  function groupRowsEach(d, i) {
    console.debug('groupRowsEach', layout(d), this)
  }
}
