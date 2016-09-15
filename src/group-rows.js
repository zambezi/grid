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

    const target = select(this)
              .on('data-dirty.group-rows', () => cache = null)

    if (!cache) {
      console.warn('cache miss o_o')
      cache = layout(d.rows || d)
    } else {
      console.info('cache hit  ^_^')
    }

    d.rows = cache
  }
}
