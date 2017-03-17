export function headerBlockLayout (d) {
  const colL = d.columns.left,
    colF = d.columns.free,
    colR = d.columns.right,
    scrollerWidth = d.scrollerWidth,
    clippedVertical = d.bodyBounds.clippedVertical

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
