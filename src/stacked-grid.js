export function createStackedGrid() {
  function stackedGrid(s) {
    s.each(stackedGridEach)
  }

  return stackedGrid

  function stackedGridEach(d, i) {
    console.log('Just got to the each func', d, this)
  }
}