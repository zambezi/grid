import { createGroupRowsLayout } from './group-rows-layout'
import { partial } from 'underscore'
import { property, negate } from '@zambezi/fun'
import { rebind } from '@zambezi/d3-utils'
import { select } from 'd3-selection'
import { selectionChanged, emptyIfFormat } from '@zambezi/d3-utils'

import './group-rows.css'

const isRollupRow = property('row.isRollup')
    , isRollupChanged = selectionChanged()
          .key(isRollupRow)

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

    d.dispatcher.on('row-update.group-rows', onRowUpdate)

    if (!cache) cache = layout(d.rows || d)
    d.rows = cache
  }

  function onRowUpdate(d, i) {
    select(this).select(isRollupChanged)
        .classed('is-rollup-row', isRollupRow)
  }
}

export function formatRollup(formatter) {
  return partial(emptyIfFormat, negate(property('isRollup')), formatter)
}

export function formatNonRollup(formatter) {
  return partial(emptyIfFormat, property('isRollup'), formatter)
}
