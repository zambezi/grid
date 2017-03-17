export function headerBlockLayout (d) {
  const colL = d.columns.left
  const colF = d.columns.free
  const colR = d.columns.right
  const scrollerWidth = d.scrollerWidth
  const clippedVertical = d.bodyBounds.clippedVertical

  return [
    {
      cols: colL,
      width: colL.measuredWidth
    },
    {
      cols: colF,
      left: colL.measuredWidth,
      right: colR.measuredWidth + (clippedVertical ? scrollerWidth : 0),
      scrollLeft: d.scroll.left,
      isScrolledLeft: colF.isScrolledLeft,
      isScrolledRight: colF.isScrolledRight
    },
    {
      cols: colR,
      right: clippedVertical ? scrollerWidth : 0,
      width: colR.measuredWidth
    }
  ]
}
