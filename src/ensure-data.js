import { select } from 'd3-selection'

export function ensureData(d, i) {
  let rows = d || []
  rows.rows = null
  select(this).datum(rows)
}
