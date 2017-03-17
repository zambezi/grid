import { select, event } from 'd3-selection'
import { selectionChanged } from '@zambezi/d3-utils'
import { unwrap } from './unwrap-row'

import './simple-nested-row-expanders.css'

export function createSimpleNestedRowExpanders () {
  const changed = selectionChanged()

  function simpleNestedRowExpanders (d) {
    const row = d.row
    const hasNested = !!(row.children && row.children.length)
    const isExpand = hasNested && row.expanded
    const isCollapse = hasNested && !isExpand

    select(this)
      .select(changed.key(d => `${hasNested}|${isExpand}|${isCollapse}`))
        .classed('simple-nested-expander-cell', true)
        .classed('is-expand', isExpand)
        .classed('is-collapse', isCollapse)
        .on('click.simple-expander-toggle',
          isExpand ? collapse
        : isCollapse ? expand
        : null
        )
        .on('click.simple-expander-redraw', hasNested ? redraw : null)

    function expand (d) {
      unwrap(d.row).expanded = true
    }

    function collapse (d) {
      unwrap(d.row).expanded = false
    }

    function redraw () {
      event.stopImmediatePropagation()

      select(this)
        .dispatch('data-dirty', { bubbles: true })
        .dispatch('redraw', { bubbles: true })
    }
  }

  return simpleNestedRowExpanders
}
