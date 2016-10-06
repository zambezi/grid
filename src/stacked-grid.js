export function createStackedGrid() {
  const rowCount = 40

  function stackedGrid(s) {
    s.each(stackedGridEach)
  }

  return stackedGrid

  function stackedGridEach(d, i) {
    const chunks = d.reduce(toChunks, [])
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
