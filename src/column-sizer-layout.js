import { isUndefined } from 'underscore'
import { property } from '@zambezi/fun'

const id = property('id')

export function createColumnSizerLayout () {
  let include
  let resizeColumnsByDefault = true

  function columnSizerLayout (d) {
    const colsL = d.columns.left
    const colsR = d.columns.right
    const bodyBounds = d.bodyBounds
    const scrollerWidth = d.scrollerWidth
    const freeLeft = colsL.measuredWidth
    const freeRight = bodyBounds.width - colsR.measuredWidth -
          (bodyBounds.clippedVertical ? scrollerWidth : 0)

    const leftPositions = colsL.leafColumns.filter(resizable)
              .map(layoutWithOffset(0))

    const freePositions = d.columns.free.leafColumns
              .filter(resizable)
              .map(
                layoutWithOffset(freeLeft - d.scroll.left)
              ).filter(visibleOnly)
    const rightPositions = colsR.leafColumns
              .filter(resizable)
              .map(
                layoutWithOffset(
                  bodyBounds.width - colsR.measuredWidth -
                      (bodyBounds.clippedVertical ? scrollerWidth : 0)
                , true
                )
              )

    return leftPositions
        .concat(freePositions)
        .concat(rightPositions)

    function visibleOnly (d) {
      if (include && include[ id(d) ]) return true
      if (d.hidden) return false
      return d.left > freeLeft && d.left < freeRight
    }

    function resizable (d, i) {
      return (
        isUndefined(d.resizable) ? resizeColumnsByDefault : d.resizable
      )
    }
  }

  columnSizerLayout.resizeColumnsByDefault = function (value) {
    if (!arguments.length) return resizeColumnsByDefault
    resizeColumnsByDefault = value
    return columnSizerLayout
  }

  columnSizerLayout.include = function (value) {
    if (!arguments.length) return include
    include = value
    return columnSizerLayout
  }

  return columnSizerLayout
}

function layoutWithOffset (offset, lockRight) {
  return function sizerLayout (d, i) {
    const left = offset + d.absoluteOffset - 4 + (!lockRight ? d.width : 0)
    return {
      left,
      column: d,
      id: d.id,
      offset,
      locked: d.isChild ? d.parentColumn.locked : d.locked,
      hidden: d.hidden || (d.parentColumn && d.parentColumn.hidden)
    }
  }
}
