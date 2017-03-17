import { nestedRowsFilter } from './nested-rows-filter'
import { select } from 'd3-selection'
import { wrap } from './wrap-row'

export function createProcessRowData () {
  let cache
  let filters = []
  let nestFriendlyFilters
  let skipRowLocking = false

  function processRowData (s) {
    s.each(processRowDataEach)
  }

  processRowData.filtersUse = function (filter) {
    filters.push(filter)
    return processRowData
  }

  processRowData.filters = function (v) {
    if (!arguments.length) return filters
    filters = v
    return processRowData
  }

  return processRowData

  function processRowDataEach (d, i) {
    nestFriendlyFilters = filters.map(nestedRowsFilter)
    if (!cache) cache = processRows(d, d.serverSideFilterAndSort)
    select(this).on('data-dirty.process-row-data', onDataDirty)
    d.rows = cache
    d.filters = nestFriendlyFilters
  }

  function processRows (d, skipFilters) {
    const rows = d.rows || d
    const rowGroups = group(rows, skipFilters, skipRowLocking, filter)
    const rowsTop = rowGroups.top
    const rowsFree = rowGroups.free
    const rowsBottom = rowGroups.bottom

    rowsTop.name = 'top'
    rowsFree.name = 'free'
    rowsBottom.name = 'bottom'

    let result = rowsTop.concat(rowsFree).concat(rowsBottom)
    result.top = rowsTop
    result.free = rowsFree
    result.bottom = rowsBottom

    result.hasNestedRows = rows.hasNestedRows

    return result

    function filter (d, i, a) {
      if (skipFilters) return true
      return nestFriendlyFilters.every(runFilter)
      function runFilter (f) {
        return f(d, i, a)
      }
    }
  }

  function onDataDirty () {
    cache = null
  }

  function group (rows, skipFilters, skipLock, filter) {
    const top = []
    const bottom = []
    const free = []
    const out = []

    let freeIndexShift = 0

    if (skipFilters && skipLock) {
      return { top, bottom, free: rows, out }
    }

    rows.forEach(segregate)
    free.length = rows.length - (top.length + bottom.length + out.length)

    return { top, free, bottom, out }

    function segregate (originalRow, i) {
      if (!originalRow) return

      let row = wrap(originalRow)
      let locked = row.locked

      if (!skipFilters && !filter(row)) pluck(row, out)
      else if (!skipLock && locked === 'top') pluck(row, top)
      else if (!skipLock && locked === 'bottom') pluck(row, bottom)
      else free[i + freeIndexShift] = row

      function pluck (row, target) {
        target.push(row)
        freeIndexShift--
      }
    }
  }
}
