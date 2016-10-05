export function createMouseWheel() {
  function mouseWheel(s) {
    s.each(mouseWheelEach)
  }

  return mouseWheel

  function mouseWheelEach(d, i) {
    console.log('mouseWheelEach', d, this)
  }
}
