import { createGroupRowsLayout } from './group-rows-layout'
import { partial } from 'underscore'
import { property, negate } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged, emptyIfFormat, rebind } from '@zambezi/d3-utils'

import './group-rows.css'

const isRollupRow = property('row.isRollup')

export function createGroupRows () {
  const layout = createGroupRowsLayout()
  const isRollupChanged = selectionChanged().key(isRollupRow)

  let cache = null

  function groupRows (s) {
    s.each(groupRowsEach)
  }

  return rebind().from(layout, 'groupings')(groupRows)

  function groupRowsEach (d, i) {
    select(this).on('data-dirty.group-rows', () => (cache = null))
    d.dispatcher.on('row-update.group-rows', onRowUpdate)
    if (!cache) cache = layout(d.rows || d)
    d.rows = cache
  }

  function onRowUpdate (d, i) {
    select(this).select(isRollupChanged)
        .classed('is-rollup-row', isRollupRow)
  }
}

export function formatRollup (formatter) {
  return partial(emptyIfFormat, negate(property('isRollup')), formatter)
}

export function formatNonRollup (formatter) {
  return partial(emptyIfFormat, property('isRollup'), formatter)
}
