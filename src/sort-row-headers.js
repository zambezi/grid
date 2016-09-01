import { property } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged } from '@zambezi/d3-utils'

import './sort-row-headers.css'

const sortAscending = property('sortAscending')
    , sortDescending = property('sortDescending')

export function createSortRowHeaders() {
  const changed = selectionChanged().key(sortDirection)
  let sortableByDefault = true

  function sortRowHeaders(s) {
    s.each(sortRowHeadersEach)
  }

  sortRowHeaders.sortableByDefault = function(value) {
    if (!arguments.length) return sortableByDefault
    sortableByDefault = value
    return sortRowHeaders
  }

  return sortRowHeaders

  function sortRowHeadersEach(d, i) {
    const layout = d
        , target = select(this)
        , dispatcher = d.dispatcher

    target.selectAll('.zambezi-grid-headers .zambezi-grid-header')
      .each(updateSortHandlers)
      .select(changed)
        .classed('is-sortable', sortable)
        .classed('is-sort-ascending', sortAscending)
        .classed('is-sort-descending', sortDescending)

    function updateSortHandlers(d, i) {
      select(this).on(
        'click.zambezi-grid-headers'
      , sortable(d) ? onHeaderClick : null
      )
    }

    function onHeaderClick(d, i) {
      const wasAscending = d.sortAscending
          , wasDescending = d.sortDescending

      layout.columns.forEach(clearColumnSort)

      if (wasDescending) d.sortAscending = true
      else if (!wasAscending)  d.sortDescending = true

      target
          .dispatch('data-dirty')
          .dispatch('sort-changed', { detail: d })
          .dispatch('redraw')

      function clearColumnSort(d, i) {
        d.sortAscending = false
        d.sortDescending = false
        if (d.children) d.children.forEach(clearColumnSort)
      }
    }
  }

  function sortDirection(d) {
    return  !sortable(d)      ? '-'
          : d.sortAscending   ? 'A'
          : d.sortDescending  ? 'D'
          : '×'
  }

  function sortable(d, i) {
    if ('sortable' in d) return d.sortable
    return sortableByDefault
  }

}


