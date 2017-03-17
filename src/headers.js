import { functor, property } from '@zambezi/fun'
import { headerBlockLayout } from './header-block-layout'
import { isNumber, isString } from 'underscore'
import { select } from 'd3-selection'
import { selectionChanged, appendFromTemplate } from '@zambezi/d3-utils'

import './headers.css'

const append = appendFromTemplate(
        `<li class="zambezi-grid-header">
          <span class="cell-text"></span>
        </li>`
      )
    , appendDouble = appendFromTemplate(
        `<li class="zambezi-grid-double-header">
          <div class="double-header-highlight-area"></div>
          <span class="cell-text"></span>
          <ul class="zambezi-grid-nested-headers"></ul>
        </li>`
      )
    , width = pixels('width')
    , offset = pixels('offset')
    , left = pixels('left')
    , right = pixels('right')
    , scrollLeft = property('scrollLeft')
    , isScrolledLeft = property('cols.isScrolledLeft')
    , isScrolledRight = property('cols.isScrolledRight')
    , isHorizontalShort = property('cols.isHorizontalShort')

export function createHeaders() {
  const columnCellsChanged = selectionChanged()
            .key(columnChangeKey)
      , scrollChanged = selectionChanged()

  function headers(s) {
    s.each(headersEach)
  }

  return headers

  function headersEach(d, i) {
    const layout = d
        , headers = select(this)
              .select('.zambezi-grid-headers')
        , blocks = headers.selectAll('.zambezi-grid-header-block')
            .data(headerBlockLayout(d))
        , blocksEnter = blocks.enter()
            .append('ul')
              .classed('zambezi-grid-header-block', true)
        , blocksAll = blocks.merge(blocksEnter)
        , cells = blocksAll
              .classed('is-horizontal-short', isHorizontalShort)
            .selectAll('.zambezi-grid-top-level-header')
            .data(cellData, cellId)
        , cellsEnter = cells.enter()
            .select(appendHeader)
              .classed('zambezi-grid-top-level-header', true)
        , cellsExit = cells.exit().remove()

    scrollChanged.key(functor(layout.scroll.left))

    cells.merge(cellsEnter)
      .select(columnCellsChanged)
        .call(drawNestedElements)
        .call(updateCells)

    blocksAll.call(updateBlock)
  }

  function appendHeader(d, i) {
    return (d.children ? appendDouble : append).apply(this, arguments)
  }

  function updateCells(s) {
    s.style('width', width)
        .style('left', offset)
      .select('.cell-text')
        .text(labelOrKey)
        .attr('title', labelOrKey)
  }

  function updateBlock(s) {
    s.style('left', left)
        .style('right', right)
        .style('width', width)
        .classed('is-scrolled-left', isScrolledLeft)
        .classed('is-scrolled-right', isScrolledRight)
        .filter(scrollLeftDefined)
      .select(scrollChanged)
        .property('scrollLeft', scrollLeft)
  }

  function drawNestedElements(s) {
    const headers = s.select('.zambezi-grid-nested-headers')
              .style('width', width)
            .selectAll('.zambezi-grid-header')
            .data(children)
        , headersEnter = headers.enter().select(append)
        , headersExit = headers.exit().remove()

    headers.merge(headersEnter)
        .call(updateCells)
  }

  function cellId(d) {
    return d.id + ( d.children ? '-with-children' : '-without-children')
  }
}

function columnChangeKey(column) {
  return [
    column.id
  , column.label || '·'
  , column.key || '·'
  , ~~column.offset
  , ~~column.absoluteOffset
  , ~~column.width
  , column.sortAscending || '·'
  , column.sortDescending || '·'
  ]
  .concat(
    column.children ?
    ( '(' + column.children.map(columnChangeKey).join(',') + ')' )
    : []
  )
  .join('|')
}

function scrollLeftDefined(d) {
  return isNumber(d.scrollLeft)
}

function labelOrKey(d) {
  return isString(d.label) ? d.label : d.key
}

function children(d) {
  return (d.children && d.children.filter(notHidden)) || []
}

function pixels(property) {
  return function(d, i) {
    const value = d[property]
    if (!isNumber(value)) return null
    return value + 'px'
  }
}

function cellData(d) {
  return d.cols.filter(notHidden)
}

function notHidden(column) {
  const children = column.children
  return !column.hidden && (!children || children.some(notHidden))
}
