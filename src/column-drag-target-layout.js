import { range } from 'd3-array'

export function columnDragTargetLayout (d) {
  const colsL = d.columns.left.leafColumns.filter(notHidden)
  const colsR = d.columns.right.leafColumns.filter(notHidden)
  const colsF = d.columns.free.leafColumns.filter(notHidden)
  const leafColumns = d.columns.leafColumns.filter(notHidden)
  const rightBound = d.bodyBounds.width - (d.clippedVertical ? d.scrollerWidth : 0)
  const freeL = d.columns.left.measuredWidth
  const freeR = rightBound - d.columns.right.measuredWidth
  const isShort = ~~d.columns.free.measuredWidth < ~~d.columns.free.actualWidth

  const positionsLeft = colsL.length
              ? range(colsL.length + 1)
                    .map(buildPositionsWithOffset(0, 'L'))
              : []

  const positionsFree = colsF.length
          ? range(colsL.length, colsL.length + colsF.length + 1)
              .map(buildPositionsWithOffset(freeL - d.scroll.left, 'F', 1))
              .filter(cullVisible)
          : []

  const positionsRight = colsR.length
          ? range(leafColumns.length - colsR.length, leafColumns.length + 1)
                .map(buildPositionsWithOffset(freeR, 'R', 2))
          : []

  return positionsLeft
      .concat(positionsFree)
      .concat(positionsRight)
      .filter(Boolean)

  function buildPositionsWithOffset (leftOffset, prefix, index) {
    return function buildPosition (i, j, a) {
      const isFree = index === 1
      const isLockedRight = index === 2
      const isFirstInBlock = j === 0
      const isLastInBlock = j + 1 === a.length
      const columnLeft = leafColumns[i - 1]
      const columnRight = leafColumns[i]
      const lastFreeWhenShort = isFree && isShort && isLastInBlock
      const left = (
                isLastInBlock
              ? columnLeft.absoluteOffset + columnLeft.width
              : columnRight.absoluteOffset
              ) + leftOffset - 10
      const id = [ prefix, (columnLeft && columnLeft.id), (columnRight &&
        columnRight.id)].filter(Boolean).join('-')

      const parentForLeft =
            (isLockedRight && isShort && isFirstInBlock) ? null
          : parentFor(columnLeft)

      const parentForRight =
            lastFreeWhenShort ? null
          : parentFor(columnRight)

      const parentForCenter =
            parentForLeft === parentForRight ? parentForLeft
          : null

      const lockedForLeft =
            lockedFor(columnRight) === 'left' ? 'left'
          : (isLockedRight && isShort && isFirstInBlock) ? null
          : lockedFor(columnLeft)

      const lockedForRight =
            lockedFor(columnLeft) === 'right' ? 'right'
          : lastFreeWhenShort ? null
          : lockedFor(columnRight)

      const lockedForCenter =
            lockedForLeft === lockedForRight ? lockedForLeft
          : isLastInBlock ? lockedForLeft
          : isFirstInBlock ? lockedForRight
          : null

      return {
        left,
        id,
        columnLeft,
        columnRight,
        parentForCenter,
        parentForLeft,
        parentForRight,
        lockedForLeft,
        lockedForRight,
        lockedForCenter
      }
    }
  }

  function cullVisible (position) {
    if (position.left < freeL) return false
    if (position.left > freeR) return false
    return true
  }
}

function lockedFor (column) {
  if (!column) return null
  if (column.isChild) return column.parentColumn.locked
  return column.locked
}

function parentFor (column) {
  if (!column) return null
  if (column.isChild) return column.parentColumn
  return null
}

function notHidden (d) {
  return !d.hidden
}
