import './nested-row-expanders.css'

export function createNestedRowExpanders() {

  function nestedRowExpanders(d, i) {
    console.log('nestedRowExpanders', d, this)
  }

  return nestedRowExpanders
}
