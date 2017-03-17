import { select } from 'd3-selection'
import { uniqueId } from 'underscore'

export function ensureId (d, i) {
  const target = select(this)
  if (target.attr('id')) return
  target.attr(
    'id',
    (this.dataset && this.dataset.componentId) ||
        target.attr('data-component-id') || uniqueId('gen-grid-')
  )
}
