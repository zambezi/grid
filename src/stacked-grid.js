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
    const target = select(this).classed('zambezi-stacked-grid', true)
        , masterGridTarget = target.select(appendMaster).call(masterGrid)
  }

  function sliceDataForSlaveGrids(d) {
    const { rowHeight, bodyBounds } = d
        , rowsPerPage = Math.floor(bodyBounds.height / rowHeight)
        , chunks = d.reduce(toChunks, [])

    debugger

    function toChunks(acc, next, i) {
      const chunkIndex = Math.floor(i / rowsPerPage)
        , modIndex = i % rowsPerPage
        , chunk = acc[chunkIndex] || []

      chunk[modIndex] = next
      acc[chunkIndex] = chunk

      return acc
    }
  }

  function stackedGridEachAfter(d, i) {
    const chunks = d.reduce(toChunks, [])
        , target = select(this).classed('zambezi-stacked-grid', true)
        , update =  target.selectAll('.grid-page')
            .data(chunks)
        , enter = update.enter().append('div').classed('grid-page', true)
        , exit  = update.exit().remove()

    update.merge(enter).each(drawGridPage)
    gridPool.length = chunks.length
    console.log('\nChunks: ', chunks)
  }

  function drawGridPage(d, i) {
    let grid = gridPool[i]

    if (!grid) {
      grid = createGrid().serverSideFilterAndSort(true)
      if (!i) grid.useAfterMeasure(s => s.each((d, i) => {
        console.log('Component called', d, i)

      }))
      gridPool[i] = grid
    }

    select(this)
        .style('height', '300px')
        .style('width', '500px')
        .style('display', 'inline-block')
        .call(grid)
  }

}
