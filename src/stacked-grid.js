import { select } from 'd3-selection'
import { appendIfMissing } from '@zambezi/d3-utils'
import { createGrid } from './grid'
import './stacked-grid.css'

export function createStackedGrid() {
  const gridPool = []
      , masterGrid = createGrid()
            .serverSideFilterAndSort(true)
            .useAfterMeasure(s => s.each(sliceDataForSlaveGrids))
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
    const { rowHeight, bodyBounds } = d
        , rowsPerPage = Math.floor((bodyBounds.height - 10) / rowHeight)
        , chunks = d.reduce(toChunks, [])

    d.rows.free = chunks.shift()

    const update = target.selectAll('.grid-page.slave-grid')
            .data(chunks)
        , enter = update.enter().append('div').classed('grid-page slave-grid', true)

    update.exit().remove()

    update.merge(enter).each(drawGridSlavePage)
    gridPool.length = chunks.length

    function toChunks(acc, next, i) {
      const chunkIndex = Math.floor(i / rowsPerPage)
          , modIndex = i % rowsPerPage
          , chunk = acc[chunkIndex] || []

      chunk[modIndex] = next
      acc[chunkIndex] = chunk

      return acc
    }
  }

  function drawGridSlavePage(d, i) {
    let grid = gridPool[i] || createGrid().serverSideFilterAndSort(true)

    select(this).call(grid)

    gridPool[i] = grid
  }

}
