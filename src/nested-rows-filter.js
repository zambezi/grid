export function nestedRowsFilter (filter) {
  return function nestedRowFilter (initialRow, i, a) {
    return (
        downwardsRowMatch(initialRow, i, a)
    || upwardsRowMatch(initialRow.parentRow, i, a)
    )
  }

  function downwardsRowMatch (row, i, a) {
    const children = row.children
    if (filter(row, i, a)) return true
    return children && children.some(downwardsRowMatch)
  }

  function upwardsRowMatch (row, i, a) {
    if (!row) return false
    if (filter(row, i, a)) return true

    return upwardsRowMatch(row.parentRow, 0, a)
  }
}
