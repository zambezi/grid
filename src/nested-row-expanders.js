import './nested-row-expanders.css'
import { functor } from '@zambezi/fun'
import { select, event } from 'd3-selection'
import { selectionChanged } from '@zambezi/d3-utils'
import { unwrap } from './unwrap-row'

const collapse = 'is-collapse'
    , expand = 'is-expand'
    , upRight = 'is-up-right'
    , verticalRight = 'is-vertical-right'
    , horizontal = 'is-horizontal'
    , vertical = 'is-vertical'
    , classes = [
        collapse, expand, upRight, verticalRight, horizontal, vertical
      ]
    , changed = selectionChanged()

export function createNestedRowExpanders() {

  function nestedRowExpanders(d, i) {

    const cell = d3.select(this).classed('nested-expander-cell', true)
        , row = d.row
        , column = d.column
        , value = d.value

        , hasNested = !!(row.children && row.children.length)
        , isExpanded = row.expanded
        , nestLevel = row.nestLevel
        , parentRow = row.parentRow
        , isChild = !!parentRow
        , isLast = row.isLast
        , parentLinesData = buildParentLineData()
        , update = cell.select(changed.key(functor(parentLinesData.join('×'))))
            .selectAll('.nested-indicator, .nested-text-field, .formatted-text')
            .data(parentLinesData)
        , enter = update.enter().append('span')
        , exit = update.exit().remove()
        , merge = update.merge(enter)

    merge.classed('formatted-text', false)
        .each(updateNestedIndicatorClasses)
      .filter(isNestedIndicator)
        .text('')
        .classed('nested-indicator', true)
        .classed('nested-text-field', false)
        .on('click.expand-collapse', onClick)

    merge
      .filter(isNestedTextField)
        .text(String)
        .classed('nested-text-field', true)
        .classed('nested-indicator', false)
        .on('click.expand-collapse', null)

    function updateNestedIndicatorClasses(d) {
      const indicator = select(this)
      classes.forEach(c => indicator.classed(c, c == d))
    }

    function isNestedIndicator(d, i) {
      if (i < parentLinesData.length - 1) console.log(d, 'isNestedIndicator')
      else console.log(d, 'is not nested indicator')

      return (i < parentLinesData.length - 1)
    }

    function isNestedTextField(d, i) {
      return !isNestedIndicator(d, i) 
    }

    function onClick(state, i) {

      console.debug('onClick', state)

      const row = cell.datum().row 

      if (state !== collapse && state !== expand) return
      unwrap(row).expanded = !row.expanded

      event.stopImmediatePropagation()

      select(this)
          .dispatch('data-dirty', { bubbles: true })
          .dispatch('redraw', { bubbles: true })
    }

    function buildParentLineData() {
      const result = [
              hasNested ? isExpanded ? collapse : expand
            : isChild   ? horizontal : ''
            ]

      if (isChild) result.unshift(isLast ?  upRight : verticalRight)

      prependParentRowExtension(parentRow)

      return result.concat(column.format(value))

      function prependParentRowExtension(row) {
        if (!row) return
        if (!row.parentRow) return
        result.unshift(row.isLast ? '' : vertical)
        prependParentRowExtension(row.parentRow)
      }
    }
  }
  return nestedRowExpanders
}
