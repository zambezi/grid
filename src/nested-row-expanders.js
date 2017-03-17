import './nested-row-expanders.css'
import { functor } from '@zambezi/fun'
import { select, event } from 'd3-selection'
import { selectionChanged } from '@zambezi/d3-utils'
import { unwrap } from './unwrap-row'

const collapse = 'is-collapse'
const expand = 'is-expand'
const upRight = 'is-up-right'
const verticalRight = 'is-vertical-right'
const horizontal = 'is-horizontal'
const vertical = 'is-vertical'
const classes = [ collapse, expand, upRight, verticalRight, horizontal,
          vertical ]

export function createNestedRowExpanders () {
  const changed = selectionChanged()

  function nestedRowExpanders (d, i) {
    const cell = select(this).classed('nested-expander-cell', true)
    const column = d.column
    const value = d.value
    const row = d.row
    const parentLinesData = buildParentLineData(row).concat(column.format(value))
    const update = cell.select(changed.key(functor(parentLinesData.join('×'))))
            .selectAll('.nested-indicator, .nested-text-field, .formatted-text')
            .data(parentLinesData)
    const enter = update.enter().append('span')
    const merge = update.merge(enter)

    update.exit().remove()
    merge.classed('formatted-text', false)
        .each(updateNestedIndicatorClasses)
      .filter(isNestedIndicator)
        .text('')
        .classed('nested-indicator', true)
        .classed('nested-text-field', false)
        .on('click.expand-collapse', onClick)

    merge.filter(isNestedTextField)
        .text(String)
        .classed('nested-text-field', true)
        .classed('nested-indicator', false)
        .on('click.expand-collapse', null)

    function updateNestedIndicatorClasses (d) {
      const indicator = select(this)
      classes.forEach(c => indicator.classed(c, c === d))
    }

    function isNestedIndicator (d, i) {
      return (i < parentLinesData.length - 1)
    }

    function isNestedTextField (d, i) {
      return !isNestedIndicator(d, i)
    }

    function onClick (state, i) {
      const row = cell.datum().row

      if (state !== collapse && state !== expand) return
      unwrap(row).expanded = !row.expanded

      event.stopImmediatePropagation()

      select(this)
          .dispatch('data-dirty', { bubbles: true })
          .dispatch('redraw', { bubbles: true })
    }
  }
  return nestedRowExpanders
}

function buildParentLineData (row) {
  const hasNested = !!(row.children && row.children.length)
  const isExpanded = row.expanded
  const parentRow = row.parentRow
  const isChild = !!parentRow
  const isLast = row.isLast
  const result = [ hasNested ? isExpanded ? collapse : expand : isChild
            ? horizontal : '' ]

  if (isChild) result.unshift(isLast ? upRight : verticalRight)
  prependParentRowExtension(parentRow)
  return result

  function prependParentRowExtension (row) {
    if (!row) return
    if (!row.parentRow) return
    result.unshift(row.isLast ? '' : vertical)
    prependParentRowExtension(row.parentRow)
  }
}
