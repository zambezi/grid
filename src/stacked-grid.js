import { select } from 'd3-selection'
import { unwrap } from './unwrap-row'
import { appendIfMissing, each, rebind } from '@zambezi/d3-utils'
import { createGridSheet } from './grid-sheet'
import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { ensureId } from './ensure-id'
import { createGrid } from './grid'
import './stacked-grid.css'

export function createStackedGrid() {
  const gridPool = []
      , updatePageWidth = createUpdatePageWidthStyles()
      , masterGrid = createGrid()
            .useAfterMeasure(each(sliceDataForSlaveGrids))
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
    const target = select(this)
            .classed('zambezi-stacked-grid', true)
            //.on('column-resized.log', () => console.log('ÝO!', masterTarget.node()))
            .on('column-resized.invalidate', () => target.selectAll('.grid-page').dispatch('size-dirty').dispatch('redraw'))
            .on('column-resized.update', updatePageWidth)
        , masterTarget = target.select(appendMaster)

    updatePageWidth.id(target.attr('id'))()
    masterTarget.call(masterGrid)
  }

  function createUpdatePageWidthStyles() {
    let id

    function updatePageWidthStyles() {
      console.log('I am called with id', id)
      const width = px(pageWidth())
      console.log('width is', width)
      sheet(
        `#${id} .grid-page`
        , {width}
      )
    }

    updatePageWidthStyles.id = function(value) {
      if (!arguments.length) return id
      id = value
      return updatePageWidthStyles
    }

    return updatePageWidthStyles
  }

  function pageWidth() {
    const columns = masterGrid.columns()
    if (!columns) return targetPageWidth
    if (!columns.every( col => !!col.width)) return targetPageWidth
    return columns.reduce((acc, col) => acc + col.width, 0)
  }

  function sliceDataForSlaveGrids(d) {
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
}
