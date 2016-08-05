import { select } from 'd3-selection'
import { columnLayout } from './column-layout'

export function calculateColumnLayout(d, i) {
  const columns = d.columns = columnLayout(d.columns)
  select(this).classed('is-double-header', columns.hasDoubleRowHeader)
}
