import { range } from 'd3-array'

export function columnDragTargetLayout(d) {

  const colsL = d.columns.left.leafColumns.filter(notHidden)
      , colsR = d.columns.right.leafColumns.filter(notHidden)
      , colsF = d.columns.free.leafColumns.filter(notHidden)
      , leafColumns = d.columns.leafColumns.filter(notHidden)
      , rightBound = d.bodyBounds.width - (d.clippedVertical ? d.scrollerWidth : 0)
      , freeL = d.columns.left.measuredWidth
      , freeR = rightBound - d.columns.right.measuredWidth
      , isShort = ~~d.columns.free.measuredWidth < ~~d.columns.free.actualWidth

      , positionsLeft = colsL.length
          ? range(colsL.length + 1)
                .map(buildPositionsWithOffset(0, "L"))
          : []

      , positionsFree = colsF.length
          ? range(colsL.length, colsL.length + colsF.length + 1)
              .map(buildPositionsWithOffset(freeL - d.scroll.left, "F", 1))
              .filter(cullVisible)
          : []

      , positionsRight = colsR.length
          ? range(leafColumns.length - colsR.length , leafColumns.length + 1)
                .map(buildPositionsWithOffset(freeR, "R", 2))
          : []

  return positionsLeft
      .concat(positionsFree)
      .concat(positionsRight)
      .filter(Boolean)

  function buildPositionsWithOffset(leftOffset, prefix, index) {
    return function buildPosition(i, j, a) {
      var isFree = index == 1
        , isLockedRight = index == 2
        , isFirstInBlock = j == 0
        , isLastInBlock = j + 1 == a.length
        , columnLeft = leafColumns[i - 1]
        , columnRight = leafColumns[i]
        , lastFreeWhenShort = isFree &&  isShort && isLastInBlock
        , x = (
                isLastInBlock ?
                columnLeft.absoluteOffset + columnLeft.width
              : columnRight.absoluteOffset
              ) + leftOffset - 10
        , id = [ prefix
            , (columnLeft && columnLeft.id)
            , (columnRight && columnRight.id)
          ].filter(Boolean).join("-")

      , parentForLeft =
            (isLockedRight && isShort && isFirstInBlock) ? null
          : parentFor(columnLeft)

      , parentForRight =
            lastFreeWhenShort ? null
          : parentFor(columnRight)

      , parentForCenter =
            parentForLeft == parentForRight ? parentForLeft
          : null

      , lockedForLeft =
            lockedFor(columnRight) == "left"  ? "left"
          : (isLockedRight && isShort && isFirstInBlock) ?  null
          : lockedFor(columnLeft)

      , lockedForRight =
            lockedFor(columnLeft) == "right"  ? "right"
          : lastFreeWhenShort                 ? null
          : lockedFor(columnRight)

      , lockedForCenter =
            lockedForLeft == lockedForRight ? lockedForLeft
          : isLastInBlock                   ? lockedForLeft
          : isFirstInBlock                  ? lockedForRight
          : null

      return {
        left: x
      , id: id
      , columnLeft: columnLeft
      , columnRight: columnRight
      , parentForCenter: parentForCenter
      , parentForLeft: parentForLeft
      , parentForRight: parentForRight
      , lockedForLeft: lockedForLeft
      , lockedForRight: lockedForRight
      , lockedForCenter: lockedForCenter
      }
    }
  }

  function cullVisible(position) {
    if (position.left < freeL) return false
    if (position.left > freeR) return false
    return true
  }
}

function lockedFor(column) {
  if (!column) return null
  if (column.isChild) return column.parentColumn.locked
  return column.locked
}

function parentFor(column) {
  if (!column) return null
  if (column.isChild) return column.parentColumn
  return null
}

function notHidden(d) {
  return !d.hidden
}
