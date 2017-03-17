import _ from 'underscore'

const separator = '∵'

export function createGroupRowsLayout () {
  let groupings = []
  let nestedRowsMap

  function groupRowsLayout (d) {
    if (!groupings.length) return d
    return group(0, d)

    function group (depth, rows, previousKey) {
      if (depth >= groupings.length) return rows

      const grouping = groupings[depth]
      const key = grouping.key
      const rollupKey = previousKey || ''
      const rollup = _.partial(grouping.rollup, _, grouping)
      const parentRowByKey = {}
      const groupedRows = []

      if (!nestedRowsMap) nestedRowsMap = {}

      rows.forEach(categorize)

      const rolledUpRows = groupedRows.map(rollup)

      if (depth < groupings.length) rolledUpRows.forEach(groupChildren)

      return rolledUpRows

      function groupChildren (row) {
        if (!row.children) return
        row.children = group(
          depth + 1
        , row.children
        , row.isRollup && row.rollupRowKey || ''
        )
      }

      function categorize (row) {
        const k = key(row)
        const rowKey = rollupKey + (rollupKey ? separator : '') + k

        let parentRow = parentRowByKey[k]

        if (!parentRow) {
          groupedRows.push(
            parentRowByKey[k] =
              nestedRowsMap[rowKey] =
              parentRow =
                Object.assign(
                  nestedRowsMap[rowKey] || {},
                  {
                    children: [ ],
                    isRollup: true,
                    rollupRowKey: rowKey,
                    expanded: nestedRowsMap && nestedRowsMap[rowKey] &&
                        nestedRowsMap[rowKey].expanded
                  }
                )
          )
        }

        parentRow.children.push(row)
      }
    }
  }

  groupRowsLayout.groupings = function (value) {
    if (!arguments.length) return groupings
    groupings = value
    nestedRowsMap = null
    return groupRowsLayout
  }

  return groupRowsLayout
}
