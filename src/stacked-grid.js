import { select } from 'd3-selection'
import { unwrap } from './unwrap-row'
import { appendIfMissing, each } from '@zambezi/d3-utils'
import { createGrid } from './grid'
import './stacked-grid.css'

export function createStackedGrid() {
  const gridPool = []
      , masterGrid = createGrid()
            .useAfterMeasure(each(sliceDataForSlaveGrids))
      , appendMaster = appendIfMissing('div.grid-page.master-grid')

  function stackedGrid(s) {
    s.each(stackedGridEach)
  }

  return stackedGrid

  function stackedGridEach(d, i) {
    const target = select(this)
            .classed('zambezi-stacked-grid', true)

    target.select(appendMaster).call(masterGrid)
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
