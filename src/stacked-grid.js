import { select } from 'd3-selection'
import { createGrid } from './grid'

export function createStackedGrid() {
  const rowCount = 7
      , gridPool = []

  function stackedGrid(s) {
    s.each(stackedGridEach)
  }

  return stackedGrid

  function stackedGridEach(d, i) {
    const chunks = d.reduce(toChunks, [])
        , target = select(this)
        , update =  target.selectAll('.grid-page')
            .data(chunks)
        , enter = update.enter().append('div').classed('grid-page', true)
        , exit  = update.exit().remove()

    update.merge(enter).each(drawGridPage)

    console.log('\nChunks: ', chunks)
  }

  function drawGridPage(d, i) {
    const grid = gridPool[i] || createGrid()
    select(this)
        .style('height', '300px')
        .style('width', '500px')
        .style('display', 'inline-block')
        .call(grid)
    gridPool[i] = grid
  }

  function toChunks(acc, next, i) {
    const chunkIndex = Math.floor(i / rowCount)
        , modIndex = i % rowCount
        , chunk = acc[chunkIndex] || []

    chunk[modIndex] = next
    acc[chunkIndex] = chunk

    return acc
  }
}
