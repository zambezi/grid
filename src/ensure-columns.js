import { find, isUndefined } from 'underscore'

export function createEnsureColumns () {
  let columns

  function ensureColumns (s) {
    s.each(ensureColumnsEach)
  }

  ensureColumns.columns = function (value) {
    if (!arguments.length) return columns
    columns = value
    return ensureColumns
  }

  return ensureColumns

  function ensureColumnsEach (d, i) {
    if (!columns) columns = createDefaultColumns(d)
    d.columns = columns
  }

  function createDefaultColumns (d) {
    const firstRow = find(d, d => !isUndefined(d)) || {}
    return Object.keys(firstRow).map(createDefaultColumn)
  }

  function createDefaultColumn (key) {
    return { key }
  }
}
