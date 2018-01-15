import { functor, property } from '@zambezi/fun'
import { headerBlockLayout } from './header-block-layout'
import { isNumber, isString, isUndefined } from 'underscore'
import { select } from 'd3-selection'
import { selectionChanged, appendFromTemplate } from '@zambezi/d3-utils'

import './headers.css'

const append = appendFromTemplate(
        `<li class="zambezi-grid-header">
          <span class="cell-text"></span>
        </li>`
      )
const appendDouble = appendFromTemplate(
        `<li class="zambezi-grid-double-header">
          <div class="double-header-highlight-area"></div>
          <span class="cell-text"></span>
          <ul class="zambezi-grid-nested-headers"></ul>
        </li>`
      )
const width = pixels('width')
const offset = pixels('offset')
const left = pixels('left')
const right = pixels('right')
const scrollLeft = property('scrollLeft')
const isScrolledLeft = property('cols.isScrolledLeft')
const isScrolledRight = property('cols.isScrolledRight')
const isHorizontalShort = property('cols.isHorizontalShort')

export function createHeaders () {
  const columnCellsChanged = selectionChanged().key(columnChangeKey)
  const scrollChanged = selectionChanged()

  function headers (s) {
    s.each(headersEach)
  }

  return headers

  function headersEach (d, i) {
    const layout = d
    const headers = select(this)
              .select('.zambezi-grid-headers')
    const blocks = headers.selectAll('.zambezi-grid-header-block')
            .data(headerBlockLayout(d))
    const blocksEnter = blocks.enter()
            .append('ul')
              .classed('zambezi-grid-header-block', true)
    const blocksAll = blocks.merge(blocksEnter)
    const cells = blocksAll
              .classed('is-horizontal-short', isHorizontalShort)
            .selectAll('.zambezi-grid-top-level-header')
            .data(cellData, cellId)
    const cellsEnter = cells.enter()
            .select(appendHeader)
              .classed('zambezi-grid-top-level-header', true)

    cells.exit().remove()
    scrollChanged.key(functor(layout.scroll.left))

    cells.merge(cellsEnter)
      .select(columnCellsChanged)
        .call(drawNestedElements)
        .call(updateCells)

    blocksAll.call(updateBlock)
  }

  function appendHeader (d, i) {
    return (d.children ? appendDouble : append).apply(this, arguments)
  }

  function updateCells (s) {
    s.style('width', width)
        .style('left', offset)
      .select('.cell-text')
        .text(labelOrKey)
        .attr('title', hintOrLabelOrKey)
  }

  function updateBlock (s) {
    s.style('left', left)
        .style('right', right)
        .style('width', width)
        .classed('is-scrolled-left', isScrolledLeft)
        .classed('is-scrolled-right', isScrolledRight)
        .filter(scrollLeftDefined)
      .select(scrollChanged)
        .property('scrollLeft', scrollLeft)
  }

  function drawNestedElements (s) {
    const headers = s.select('.zambezi-grid-nested-headers')
              .style('width', width)
            .selectAll('.zambezi-grid-header')
            .data(children)
    const headersEnter = headers.enter().select(append)

    headers.exit().remove()
    headers.merge(headersEnter)
        .call(updateCells)
  }

  function cellId (d) {
    return d.id + (d.children ? '-with-children' : '-without-children')
  }
}

function columnChangeKey (column) {
  return [
    column.id,
    column.label || '·',
    column.key || '·',
    ~~column.offset,
    ~~column.absoluteOffset,
    ~~column.width,
    column.sortAscending || '·',
    column.sortDescending || '·'
  ]
  .concat(
    column.children
    ? ('(' + column.children.map(columnChangeKey).join(',') + ')')
    : []
  )
  .join('|')
}

function scrollLeftDefined (d) {
  return isNumber(d.scrollLeft)
}

function labelOrKey (d) {
  return isString(d.label) ? d.label : d.key
}

function hintOrLabelOrKey (d) {
  return (isUndefined(d.hint) ? (isString(d.label) ? d.label : d.key) : d.hint)
}

function children (d) {
  return (d.children && d.children.filter(notHidden)) || []
}

function pixels (property) {
  return function (d, i) {
    const value = d[property]
    if (!isNumber(value)) return null
    return value + 'px'
  }
}

function cellData (d) {
  return d.cols.filter(notHidden)
}

function notHidden (column) {
  const children = column.children
  return !column.hidden && (!children || children.some(notHidden))
}
