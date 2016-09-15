import { createGroupRowsLayout } from './group-rows-layout'
import { rebind } from '@zambezi/d3-utils'
import { select } from 'd3-selection'

import './group-rows.css'

export function createGroupRows() {

  const layout = createGroupRowsLayout()

  let cache = null

  function groupRows(s) {
    s.each(groupRowsEach)
  }

  return rebind().from(layout, 'groupings')(groupRows)

  function groupRowsEach(d, i) {

    console.debug('groupRowsEach', layout(d), this)

    const target = select(this)
              .on('data-dirty.group-rows', () => cache = null)

    if (!cache) cache = layout(d.rows || d)
    d.rows = cache

  }
}
