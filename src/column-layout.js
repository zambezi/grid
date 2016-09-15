import { emptyIfUndefinedFormat } from '@zambezi/d3-utils'
import { property, replaceArrayContents } from '@zambezi/fun'
import { wrap } from 'underscore'
import { updateTextIfChanged } from './update-text-if-changed'

const valueByKey = {}
    , defaultFormat = wrap(String, emptyIfUndefinedFormat)

let columnIdCount = 0xA 

export function columnLayout(columns) {
  const result = validateAndSegregateColumns(columns)
  columns.hasDoubleRowHeader = columns.some(visibleWithChildren)
  return result
}

function validateAndSegregateColumns(columns) {

  const columnsLeft = []
      , columnsRight = []
      , columnsFree = []
      , columnIdsFound = {}
      , predefinedColumnId = columns.reduce(byId, {})

  columns.forEach(validateAndSegregateColumn)
  orderColumnsByBlock()
  cacheColumnSubsets()

  return columns

  function validateAndSegregateColumn(column) {
    const locked = column.locked
        , children = column.children

    if (columnHasEmptyChildren(column)) return
    clearTransientChildProperties(column)
    completeProperties(column)

    if (!columnIdIsUnique(column)) return

    function columnHasEmptyChildren(column) {
      if (!children || children.length) return false
      console.info(`Removing column with empty children: ${column.id}`)
      return true
    }

    ;(
      locked == 'left'  ? columnsLeft
    : locked == 'right' ? columnsRight
    : columnsFree
    ).push(column)

    if (children) {
      column.children =
        children.map(updateChildProperties).filter(columnIdIsUnique)
    }

    return column

    function updateChildProperties(d, i) {
      d.isChild = true
      d.parentColumn = column
      d.childIndex = i
      d.childTotal = children.length
      completeProperties(d)
      return d
    }

    function newId(column) {
      var label = column.label
        , k = (
            column.key 
          || (label && label.toLowerCase()) || '').replace(/\W+/g, '-')

        , columnKeyCount = k && predefinedColumnId[k]

      if (!k) return 'gen-' + (columnIdCount++).toString(16).toUpperCase()
      if (columnKeyCount) return k + '-' + ++predefinedColumnId[k]

      predefinedColumnId[k] = 1
      return k
    }

    function columnIdIsUnique(column) {
      if (columnIdsFound[column.id]) {
        console.error(`Repeated id for column '${column.id}', removing`)
        return false
      }
      columnIdsFound[column.id] = true
      return true
    }

    function completeProperties(column) {
      const key = column.key  || ''
      let value = valueByKey[key]

      if (!column.id) column.id = newId(column)
      if (!column.format) column.format = defaultFormat
      if (!column.components) column.components = [ updateTextIfChanged ]
      if (!value) value = valueByKey[key] = property(key)
      column.value = value

      // column.hasData = rows.some(value)
    }

  }

  function byId(acc, column) {
    if (!column) return acc
    const id = column.id
        , children = column.children

    if (id) acc[id] = 1
    if (children) children.reduce(byId, acc)
    return acc
  }

  function orderColumnsByBlock() {
    replaceArrayContents(
      columns
    , columnsLeft.concat(columnsFree).concat(columnsRight)
    )
  }

  function cacheColumnSubsets() {
    columns.left = columnsLeft
    columns.right = columnsRight
    columns.free = columnsFree
    columns.leafColumns =
        columns.right.reduce(
          findLeafColumns
        , columns.free.reduce(
            findLeafColumns
          , columns.left.reduce(
              findLeafColumns
            , []
            )
          )
        )

    columns.onlyFreeColumns = 
      !(columns.left.length + columns.right.length)

    columnsLeft.name = 'left'
    columnsFree.name = 'free'
    columnsRight.name = 'right'
  }

}

function findLeafColumns(p, c) {
  return p.concat(c.children || c)
}

function clearTransientChildProperties(column) {
  delete column.isChild
  delete column.parentColumn
  delete column.childIndex
  delete column.childTotal
}

function visibleWithChildren(column) {
  if (column.hidden) return false
  return column.children && column.children.some(d => !d.hidden)
}
