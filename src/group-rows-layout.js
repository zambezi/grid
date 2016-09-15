export function createGroupRowsLayout() {
  let groupings = []

  function groupRowsLayout(d) {
    console.debug('groupRowsLayout', d, groupings)
    return []
  }

  groupRowsLayout.groupings = function(value) {
    if (!arguments.length) return groupings
    groupings = value
    return groupRowsLayout
  }

  return groupRowsLayout
}
