export function createSimpleNestedRowExpanders() {

  function simpleNestedRowExpanders(d) {
    console.log('Called on', this, d)
  }

  return simpleNestedRowExpanders
}