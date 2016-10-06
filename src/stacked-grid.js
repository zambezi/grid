import { select } from 'd3-selection'

export function createStackedGrid() {
  const rowCount = 40

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

    update.merge(enter).text('hi, i am a grid page')

    console.log('\nChunks: ', chunks)
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
