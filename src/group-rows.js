import './group-rows.css'

export function createGroupRows() {

  function groupRows(s) {
    s.each(groupRowsEach)
  }

  return groupRows

  function groupRowsEach(d, i) {
    console.debug('groupRowsEach', d, this)
  }
}
