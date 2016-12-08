import { appendIfMissing, each, rebind } from '@zambezi/d3-utils'
import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGrid } from './grid'
import { createGridSheet } from './grid-sheet'
import { ensureId } from './ensure-id'
import { debounce } from 'underscore'
import { select } from 'd3-selection'
import { unwrap } from './unwrap-row'

import './stacked-grid.css'

export function createStackedGrid() {
  const gridPool = []
      , masterGrid = createGrid()
            .dragColumnsByDefault(false)
            .resizeColumnsByDefault(false)
            .useAfterMeasure(each(drawSlaveGrids))

      , appendMaster = appendIfMissing('div.grid-page.master-grid')
      , api = rebind().from(masterGrid, 'columns', 'resizeColumnsByDefault', 'dragColumnsByDefault', 'groupings')
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

    d.rows.free = chunks.shift()

    const update = target.selectAll('.grid-page.slave-grid')
            .data(chunks)
        , enter = update.enter()
            .append('div')
              .classed('grid-page slave-grid', true)

        , scrollLeft = target.property('scrollLeft')
        , { width } = target.node().getBoundingClientRect()
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

    gridPool.length = chunks.length

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
      const grid = gridPool[i] || createGrid().on('draw.make-visible', makeVisible)

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
