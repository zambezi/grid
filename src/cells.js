import { appendFromTemplate, selectionChanged, rebind, forward } from '@zambezi/d3-utils'
import { dispatch as createDispatch } from 'd3-dispatch'
import { property, batch } from '@zambezi/fun'
import { select } from 'd3-selection'

const appendDefaultCell = appendFromTemplate(
        '<span class="zambezi-grid-cell">'
      + '<span class="formatted-text"></span>'
      + '</span>'
      ),
  appendRow = appendFromTemplate('<li class="zambezi-grid-row"></li>'),
  id = property('id'),
  isFirst = property('isFirst'),
  isLast = property('isLast')

export function createCells () {
  const changed = selectionChanged(),
    firstLastChanged = selectionChanged().key(firstAndLast),
    indexChanged = selectionChanged().key(d => d.index),
    dispatcher = createDispatch(
          'cell-enter'
        , 'cell-exit'
        , 'cell-update'
        , 'row-changed'
        , 'row-enter'
        , 'row-exit'
        , 'row-update'
        ),
    api = rebind().from(dispatcher, 'on'),
    appendByTemplate = {}

  let rowKey,
    rowChangedKey,
    sheet,
    gridId

  function cells (s) {
    s.each(cellsEach)
  }

  cells.rowKey = function (value) {
    if (!arguments.length) return rowKey
    rowKey = value
    return cells
  }

  cells.rowChangedKey = function (value) {
    if (!arguments.length) return rowChangedKey
    rowChangedKey = value
    return cells
  }

  cells.sheet = function (value) {
    if (!arguments.length) return sheet
    sheet = value
    return cells
  }

  cells.gridId = function (value) {
    if (!arguments.length) return gridId
    gridId = value
    return cells
  }

  return api(cells)

  function cellsEach (d, i) {
    const block = this,
      list = select(this),
      visibleCellsHash = d.visibleCellsHash,
      columnComponentsAndNotifyUpdate = batch(
            runColumnComponents
          , forward(dispatcher, 'cell-update')
          ),
      columnClassAndNotifyEnter = batch(
            columnClass
          , forward(dispatcher, 'cell-enter')
          ),

      rows = list.selectAll('.zambezi-grid-row')
            .data(d, dataKey(rowKey)),

      rowsExit = rows.exit()
              .remove()
              .each(forward(dispatcher, 'row-exit')),

      rowsEnter = rows.enter()
            .select(appendRow)
              .each(forward(dispatcher, 'row-enter')),

      rowChanged = rows
            .merge(rowsEnter)
              .each(forward(dispatcher, 'row-update'))
              .call(updateRow)
            .select(
              changed.key(
                orderAndKey(rowChangedKey, visibleCellsHash)
              )
            )
              .each(forward(dispatcher, 'row-changed')),

      cellsUpdate = rowChanged.selectAll('.zambezi-grid-cell')
            .data(d => d, id),

      cellsExit = cellsUpdate.exit()
              .remove()
              .each(forward(dispatcher, 'cell-exit')),

      cellsEnter = cellsUpdate.enter()
            .select(append)
              .each(columnClassAndNotifyEnter),

      cellsMerged = cellsUpdate.merge(cellsEnter)

    cellsMerged.select(firstLastChanged).each(updateFirstLast)
    cellsMerged.each(columnComponentsAndNotifyUpdate)
  }

  function updateFirstLast () {
    select(this)
        .classed('is-first', isFirst)
        .classed('is-last', isLast)
  }

  function append (d, i, j) {
    let template = d.column.template,
      templateAppend,
      cell

    if (!template) return appendDefaultCell.call(this, d, i, j)

    templateAppend = appendByTemplate[template]

    if (!templateAppend) {
      templateAppend
        = appendByTemplate[template]
        = appendFromTemplate(template)
    }

    cell = templateAppend.call(this, d, i, j)
    select(cell).classed('zambezi-grid-cell', true)
    return cell
  }

  function runColumnComponents (d, i, j) {
    const cell = this
    if (!d.column.components) return
    d.column.components.forEach(runColumnComponent)
    function runColumnComponent (component) {
      component.call(cell, d, i, j)
    }
  }

  function updateRow (s) {
    s.select(indexChanged).each(updateTop)
  }

  function updateTop (d) {
    select(this).style('top', top)
  }
}

function columnClass (d, i) {
  select(this)
    .classed('c-' + d.column.id, true)
    .classed(d.column.className, !!d.column.className)
}

function top (d) {
  return d.top + 'px'
}

function orderAndKey (rowChangedKey, visibleCellsHash) {
  if (!rowChangedKey) return null
  return function keyPlusHash (blockRow, i) {
    if (!blockRow.length) return ''
    return (
      visibleCellsHash
    + '|'
    + rowChangedKey.call(this, blockRow[0].row, i)
    )
  }
}

function dataKey (rowKey) {
  if (!rowKey) return null
  return function rowDataKey (blockRow, i) {
    return rowKey.call(this, blockRow[0].row, i)
  }
}

function firstAndLast (d) {
  return d.isFirst + '★' + d.isLast
}

