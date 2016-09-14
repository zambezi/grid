export function createUnpackNestedRows() {
  function unpackNestedRows(s) {
    s.each(unpackNestedRowsEach)
  }

  return unpackNestedRows

  function unpackNestedRowsEach(d, i) {
    console.debug('unpackNestedRowsEach', this, d)
  }
}
