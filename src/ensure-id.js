import { select } from 'd3-selection'
import { uniqueId } from 'underscore'

export function ensureId(d, i) {
  const target = select(this)
  if (target.attr('id')) return

  target.attr(
    'id'
  , this.dataset.componentId || uniqueId('gen-grid-')
  )
}
