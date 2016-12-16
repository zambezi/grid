import { appendIfMissing, each, rebind, forward, redispatch } from '@zambezi/d3-utils'
import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGrid } from './grid'
import { createGridSheet } from './grid-sheet'
import { debounce } from 'underscore'
import { dispatch } from 'd3-dispatch'
import { ensureId } from './ensure-id'
import { select } from 'd3-selection'
import { unwrap } from './unwrap-row'

import './stacked-grid.css'

const redispatchEvents = [
        'row-enter'
      , 'row-update'
      , 'row-changed'
      , 'row-exit'
      , 'cell-enter'
      , 'cell-update'
      , 'cell-exit'
      , 'settings-changed'
      ]

export function createStackedGrid() {
  const gridPool = []
      , masterGrid = createGrid()
            .dragColumnsByDefault(false)
            .resizeColumnsByDefault(false)
            .useAfterMeasure(each(drawSlaveGrids))

      , appendMaster = appendIfMissing('div.grid-page.master-grid')
      , manualSlaveRedispatcher = dispatch.apply(null, redispatchEvents)
      , redispatcher = redispatch()
            .from(manualSlaveRedispatcher, ...redispatchEvents)
            .from(masterGrid, ...redispatchEvents)
            .create()

      , api = rebind()
            .from(redispatcher, 'on')
            .from(masterGrid, 'columns', 'resizeColumnsByDefault', 'dragColumnsByDefault', 'groupings')
      , sheet = createGridSheet()

  let targetPageWidth = 500
    , pageWidth = calculatePageWidth()

  function stackedGrid(s) {
    s.each(ensureId).each(stackedGridEach)
  }

  stackedGrid.targetPageWidth = function(value) {
    if (!arguments.length) return targetPageWidth
    targetPageWidth = value
    return stackedGrid
  }

  return api(stackedGrid)

  function stackedGridEach(d, i) {

    const target = select(this)
            .classed('zambezi-stacked-grid', true)
            .on(
              'column-resized.invalidate'
            , () => target.selectAll('.grid-page').dispatch('size-dirty').dispatch('redraw')
            )
            .on('column-resized.recalculate-width', () => pageWidth = calculatePageWidth())
            .on('column-resized.update', () => updatePageWidthStyles(id))
            .on('scroll.redraw', debounce(draw, 50, false))

        , id = target.attr('id')
        , masterTarget = target.select(appendMaster)

    updatePageWidthStyles(id)
    draw()

    function draw() {
      masterTarget.call(masterGrid)
    }

  }

  function drawSlaveGrids(d) {

    const { rowHeight, bodyBounds, scrollerWidth } = d
        , rowsPerPage = Math.floor((bodyBounds.height - scrollerWidth) / rowHeight)
        , chunks = d.rows.reduce(toChunks, [])
        , targetMaster = select(this)
        , host = select(this.parentElement)

    d.rows.free = chunks.shift()

    const update = host.selectAll('.grid-page.slave-grid')
            .data(chunks)
        , enter = update.enter()
            .append('div')
              .classed('grid-page slave-grid', true)

        , scrollLeft = host.property('scrollLeft')
        , { width } = host.node().getBoundingClientRect()
        , left = scrollLeft
        , right = scrollLeft + width

    update.exit()
      .dispatch('destroy')
      .remove()

    const merge = update.merge(enter)

    merge
      .select(inView)
        .each(drawGridSlavePage)

    merge
      .select(not(inView))
        .classed('is-visible', false)
        .dispatch('destroy')
        .html('')

    gridPool.splice(chunks.length).forEach(destroySlaveGrid)

    function toChunks(acc, next, i) {
      const chunkIndex = Math.floor(i / rowsPerPage)
          , modIndex = i % rowsPerPage
          , chunk = acc[chunkIndex] || []

      chunk[modIndex] = (chunkIndex === 0) ? next : unwrap(next)
      acc[chunkIndex] = chunk
      return acc
    }

    function not(f) {
      return function ()  {
        return !!f.apply(this, arguments) ? null : this
      }
    }

    function inView(d, i) {
      const leftEdge = (i + 1) * pageWidth
          , rightEdge = leftEdge + pageWidth
          , skip = (rightEdge < left) || (leftEdge > right)

      return skip ? null : this
    }

    function drawGridSlavePage(d, i) {
      const grid = gridPool[i] || buildSlaveGrid()

      select(this).call(
        grid.serverSideFilterAndSort(true)
          .resizeColumnsByDefault(masterGrid.resizeColumnsByDefault())
          .dragColumnsByDefault(masterGrid.dragColumnsByDefault())
          .columns(masterGrid.columns())
          .on('sort-changed.stacked-grid',
            () => {
              targetMaster
                .dispatch('data-dirty', { bubbles: true })
                .dispatch('redraw', { bubbles: true })
            }
          )
      )

      gridPool[i] = grid
    }
  }

  function destroySlaveGrid(grid) {
    grid.on('draw.make-visible', null)
    redispatchEvents
      .forEach(type => grid.on(`${type}.slave`, null))
  }

  function buildSlaveGrid() {
    const grid = createGrid().on('draw.make-visible', makeVisible)
    redispatchEvents
      .forEach(type => grid.on(`${type}.slave`, forward(manualSlaveRedispatcher, type)))

    return grid
  }

  function calculatePageWidth() {
    const columns = masterGrid.columns()
    if (!columns) return targetPageWidth
    if (!columns.every( col => !!col.width)) return targetPageWidth
    return columns.reduce((acc, col) => acc + col.width, 0)
  }

  function updatePageWidthStyles(id) {
    const width = px(pageWidth)
    sheet( `#${id} .grid-page` , { width })
  }
}

function makeVisible() {
  select(this).classed('is-visible', true)
}
