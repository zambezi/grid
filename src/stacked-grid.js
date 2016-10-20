import { appendIfMissing, each, rebind } from '@zambezi/d3-utils'
import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGrid } from './grid'
import { createGridSheet } from './grid-sheet'
import { ensureId } from './ensure-id'
import { partial } from 'underscore'
import { select } from 'd3-selection'
import { unwrap } from './unwrap-row'

import './stacked-grid.css'

export function createStackedGrid() {
  const gridPool = []
      , masterGrid = createGrid()
            .useAfterMeasure(each(drawSlaveGrids))

      , appendMaster = appendIfMissing('div.grid-page.master-grid')
      , api = rebind().from(masterGrid, 'columns')
      , sheet = createGridSheet()

  let targetPageWidth = 500

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

    let pageWidth = calculatePageWidth()

    console.log('run, page width', pageWidth)

    const target = select(this)
            .classed('zambezi-stacked-grid', true)
            .on(
              'column-resized.invalidate'
            , () => target.selectAll('.grid-page').dispatch('size-dirty').dispatch('redraw')
            )
            .on('column-resized.recalculate-width', () => pageWidth = calculatePageWidth())
            .on('column-resized.update', () => updatePageWidthStyles(id, pageWidth))
        , id = target.attr('id')
        , masterTarget = target.select(appendMaster)

    updatePageWidthStyles(id, pageWidth)
    masterTarget.call(masterGrid)
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

    update.exit().remove()

    update.merge(enter).each(drawGridSlavePage)
    gridPool.length = chunks.length

    function toChunks(acc, next, i) {
      const chunkIndex = Math.floor(i / rowsPerPage)
          , modIndex = i % rowsPerPage
          , chunk = acc[chunkIndex] || []

      chunk[modIndex] = (chunkIndex === 0) ? next : unwrap(next)
      acc[chunkIndex] = chunk

      return acc
    }

    function drawGridSlavePage(d, i) {
      const grid = gridPool[i] || createGrid()

      select(this).call(
        grid.serverSideFilterAndSort(true)
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

  function updatePageWidthStyles(id, pageWidth) {
    console.debug('updatePageWidthStyles', id)
    const width = px(pageWidth)
    sheet( `#${id} .grid-page` , { width })
  }
}
