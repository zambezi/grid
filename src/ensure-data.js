import { select } from 'd3-selection'

export function ensureData(d, i) {
  if (!d) select(this).datum([])
}
