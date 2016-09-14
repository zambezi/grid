import { select } from 'd3-selection'
import { wrap } from './wrap-row'

export function createUnpackNestedRows() {

  let cache = null
    , filters = null

  function unpackNestedRows(s) {
    s.each(unpackNestedRowsEach)
  }

  return unpackNestedRows

  function unpackNestedRowsEach(d, i) {
    if (d.serverSideFilterAndSort) return
    filters = d.filters
    if (!cache) cache = unpackRows(d)
    select(this).on('data-dirty.unpack-nested-rows', onDataDirty)
    d.rows = cache
  }

  function onDataDirty() {
    console.debug('onDataDirty (from unpack nested rows)')
    cache = null
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

        if (row.expanded) {
          children
              .map(wrap)
              .filter(filterChild)
              .map(updateNestedAttributes)
              .reduce(unpackNestedRowsForLevel(level + 1), acc)
        }

        return acc

        function filterChild(childRow) {
          childRow.parentRow = row
          return filters.every(runFilter.bind(null, childRow, i, a))
        }

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
