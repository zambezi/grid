import { ascending as ascendingComparator } from 'd3-array'
import { compareWith } from '@zambezi/fun'
import { select } from 'd3-selection'
import { uniqueId, compose, partial, isUndefined, isNull, forEach } from 'underscore'

export function createSortRows() {

  let cache

  function sortRows(s) {
    s.each(sortRowsEach)
  }

  return sortRows

  function sortRowsEach(d, i) {

    if (d.serverSideFilterAndSort) return
    if (!cache) cache = resortRows(d)

    select(this).on('data-dirty.sort-rows', onDataDirty)
    d.rows = cache
  }

  function onDataDirty() {
    cache = null
  }
}


function resortRows(d) {
  const rows = d.rows
      , columns = d.columns
      , sort = findSort(columns)
      , sortLevelId = uniqueId('andChildrenSort_')

  if (!sort) return rows

  forEach([ rows.top, rows.free, rows.bottom ], deepSort)

  const sortedRows = rows.top.concat(rows.free).concat(rows.bottom)
  sortedRows.top = rows.top
  sortedRows.free = rows.free
  sortedRows.bottom = rows.bottom

  return sortedRows

  function deepSort(nodes) {
    nodes.forEach(sortChildren)
    nodes.sort(sort)
  }

  function sortChildren(row, index) {
    const children = row.children
    addPosition(row, index)

    if (!children) return
    if (!row.expanded) return
    if (children._sortedLevelId == sortLevelId) return

    children._sortedLevelId = sortLevelId

    if (children.length === 1) {
      sortChildren(children[0])
    } else {
      deepSort(children)
    }
  }

  function addPosition(row, index) {
    if (isUndefined(row.stableSortIndex)) {
      row.stableSortIndex = index
    }
  }
}

function findSort(columns) {
  let sort

  columns.forEach(hasSort)
  return sort && stableSort

  function hasSort(column, i) {
    if (column.children) return column.children.some(hasSort)
    if (!sort) {
      sort =
        column.sortAscending   ? sortFor(column, true)
      : column.sortDescending  ? sortFor(column, false)
      : null
    } else {
      delete column.sortAscending
      delete column.sortDescending
    }
    return sort
  }

  function stableSort(a, b) {
    return sort(a, b) || sortByPosition(a, b)
  }

  function sortByPosition(a, b) {
    return a.stableSortIndex - b.stableSortIndex
  }
}

function sortFor(column, ascending) {
  const key = column.key
      , sort = column.sort

  if (!key && !sort) console.error(
    'Cannot sort on columns with no key or sort function'
  )

  return compose(
    partial((a, b) => a * b, ascending ? 1 : -1)
  , compareWith(
      sort || compareWith(ascendingComparator, definedOrEmpty)
    , column.value
    )
  )
}

function definedOrEmpty(d) {
  return (isUndefined(d) || isNull(d)) ? '' : d
}
