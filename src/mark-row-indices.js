import { select } from 'd3-selection'

const markTop = markRowIndex('top')
    , markFree = markRowIndex('free')
    , markBottom = markRowIndex('bottom')

export function createMarkRowIndices() {

  let done

  function markRowIndices(s) {
    s.each(markRowIndicesEach)
  }

  return markRowIndices

  function markRowIndicesEach(d, i) {
    select(this).on('data-dirty.mark-row-indices', onDataDirty)
    if (!done) markRows(d)
    done = true
  }

  function onDataDirty() {
    done = false
  }

  function markRows(d) {
    const rows = d.rows
    rows.top.map(markTop)
    rows.free.map(markFree)
    rows.bottom.map(markBottom)
  }
}

function markRowIndex(name) {
  return function mark(d, i) {
    d[name + 'RowNumber'] = i
    return d
  }
}
