import './simple-nested-row-expanders.css'
import { select } from 'd3-selection'

export function createSimpleNestedRowExpanders() {

  function simpleNestedRowExpanders(d) {
    console.log('Called on', this, d)

    const row = d.row
        , hasNested = !!(row.children && row.children.length)
        , isExpand = hasNested && row.expanded
        , isCollapse = hasNested && !isExpand

    select(this).classed('simple-nested-expander-cell', true)
        .classed('is-expand', isExpand)
        .classed('is-collapse', isCollapse)
  }

  return simpleNestedRowExpanders
}