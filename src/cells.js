export function createCells() {
  let rowKey
    , rowChangedKey
    , sheet
    , gridId

  function cells(s) {
    s.each(cellsEach)
  }

  cells.rowKey = function(value) {
    if (!arguments.length) return rowKey
    rowKey = value
    return cells
  }

  cells.rowChangedKey = function(value) {
    if (!arguments.length) return rowChangedKey
    rowChangedKey = value
    return cells
  }

  cells.sheet = function(value) {
    if (!arguments.length) return sheet
    sheet = value
    return cells
  }

  cells.gridId = function(value) {
    if (!arguments.length) return gridId
    gridId = value
    return cells
  }

  return cells

  function cellsEach(d, i) {
    console.debug('cellsEach', d, i, this)
  }
}
