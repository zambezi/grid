import { property } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged } from '@zambezi/d3-utils'
import { isFunction } from 'underscore'
import { wrap } from './wrap-row'

const nestRowChanged = selectionChanged()
          .key(nestRowKey)
          .debug(true)

export function createUnpackNestedRows() {

  let cache = null
    , filters = null
    , showRowWhenCollapsed = null

  function unpackNestedRows(s) {
    s.each(unpackNestedRowsEach)
  }

  unpackNestedRows.showRowWhenCollapsed = function(value) {
    if (!arguments.length) return showRowWhenCollapsed
    showRowWhenCollapsed = value
    return unpackNestedRows
  }

  return unpackNestedRows

  function unpackNestedRowsEach(d, i) {
    if (d.serverSideFilterAndSort) return
    filters = d.filters
    if (!cache) cache = unpackRows(d)

    select(this)
        .on('data-dirty.unpack-nested-rows', onDataDirty)

    d.rows = cache
    d.dispatcher.on('row-update.unpack-nested-rows', setRowNestClasses)

  }

  function onDataDirty() {
    cache = null
  }

  function setRowNestClasses(d, i) {
    select(this)
      .select(nestRowChanged)
      .each(() => this.dataset.nestLevel = d.row.nestLevel)
      .classed('is-parent-row', isParentRow)
      .classed('is-expanded', isExpanded)
  }

  function unpackRows(d) {

    let hasNestedRows = false

    const rows = d.rows
        , rowsTop = rows.top.reduce(unpackNestedRowsForLevel(0), [])
        , rowsFree = rows.free.reduce(unpackNestedRowsForLevel(0), [])
        , rowsBottom = rows.bottom.reduce(unpackNestedRowsForLevel(0), [])
        , result = rowsTop.concat(rowsFree).concat(rowsBottom)

    result.top = rowsTop
    result.free = rowsFree
    result.bottom = rowsBottom
    result.hasNestedRows = hasNestedRows

    return result

    function unpackNestedRowsForLevel(level) {
      return function unpack(acc, row, i, a) {
        const children = row.children

        row.nestLevel = level
        acc.push(row)

        if (!children) {
          return acc
        } else {
          hasNestedRows = true
        }

        if (row.expanded || showRowWhenCollapsed) {
          children
              .map(wrap)
              .filter(filterChild)
              .map(updateNestedAttributes)
              .reduce(unpackNestedRowsForLevel(level + 1), acc)

          function filterChild(childRow) {
            if (!row.expanded && isFunction(showRowWhenCollapsed) && !showRowWhenCollapsed(childRow)) return false
            childRow.parentRow = row
            return filters.every(runFilter.bind(null, childRow, i, a))
          }
        }

        return acc

        function updateNestedAttributes(d, i, a) {
          d.locked = row.locked
          d.isLast = i == (a.length - 1)
          return d
        }
      }

      function runFilter(row, i, a, f) {
        return f(row, i, a)
      }
    }
  }
}

function nestRowKey(d) {
  return `${isParentRow(d) ? '✓' : '✗'}-${isExpanded(d) ? '✓' : '✗'}-${d.row.nestLevel}`
}

function isParentRow({row}) {
  return !!row.children && row.children.length
}

function isExpanded({row}) {
  return !!row.expanded
}
