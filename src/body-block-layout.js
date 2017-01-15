export function createBodyBlockLayout() {

  let virtualizeRows = true
    , virtualizeColumns = true
    , rowKey

  function bodyBlockLayout(d) {
    const scrollerWidth = d.scrollerWidth
        , bounds = d.bodyBounds
        , rowHeight = d.rowHeight
        , rowT = d.rows.top
        , rowF = d.rows.free
        , rowB = d.rows.bottom
        , colL = d.columns.left
        , colF = d.columns.free
        , colR = d.columns.right
        , onlyFreeColumns = !colL.length && !colR.length
        , clw = colL.measuredWidth
        , crw = colR.measuredWidth
        , rth = rowT.measuredHeight
        , rbh = rowB.measuredHeight
        , freeR = bounds.clippedVertical ? crw + scrollerWidth : crw
        , freeB = bounds.clippedHorizontal ? rbh + scrollerWidth : rbh
        , scrollTop = d.scroll.top
        , scrollLeft = d.scroll.left
        , minVisibleFreeRow = Math.floor(scrollTop / rowHeight)
        , maxVisibleFreeRow = Math.floor(
            (scrollTop + rowF.actualHeight) / rowHeight
          )
        , layout = [

          // class    rows  cols  l     r      w     t     b       h    sV  sH
          [ 'body-a', rowT, colL ,     ,      ,clw  ,     ,       ,rth     ,   ]
        , [ 'body-b', rowT, colF ,clw  ,freeR ,     ,     ,       ,rth ,   ,1  ]
        , [ 'body-c', rowT, colR ,     ,      ,crw  ,     ,       ,rth ,   ,   ]


        , [ 'body-d', rowF, colL ,     ,      ,clw  ,rth  ,freeB  ,    ,1  ,   ]

        // , [ 'body-e', rowF, colF ,clw  ,freeR ,     ,rth  ,freeB  ,    ,1  ,1  ]
        , [ 'body-e', rowF, colF ,clw  ,      ,3000 ,rth  ,       ,rowF.length * rowHeight    ,1  ,1  ]

        , [ 'body-f', rowF, colR ,     ,      ,crw  ,rth  ,freeB  ,    ,1  ,   ]


        , [ 'body-g', rowB, colL ,     ,      ,clw  ,     ,       ,rbh ,   ,   ]
        , [ 'body-h', rowB, colF ,clw  ,freeR ,     ,     ,       ,rbh ,   ,1  ]
        , [ 'body-i', rowB, colR ,     ,      ,crw  ,     ,       ,rbh ,   ,   ]

        ].map(buildBlockData)

    console.log('widths:', colF.map(c => c.width))

    layout.minVisibleFreeRow = minVisibleFreeRow
    layout.maxVisibleFreeRow = maxVisibleFreeRow

    return layout

    function buildBlockData(config, i) {
      return buildBlockRows.apply(null, [i].concat(config))
    }

    function buildBlockRows(
        index, className
      , rows, columns
      , l, r, w, t, b, h, sV, sH) {

      const actualHeight = rows.actualHeight
          , lastRowIndex = rows.length - 1
          , cullDataRows = sV && virtualizeRows
          , minRowIndex = cullDataRows ? minVisibleFreeRow : 0
          , maxRowIndex = cullDataRows ?
              Math.min(lastRowIndex, maxVisibleFreeRow)
            : lastRowIndex

          , visibleLeafColumns = columns.leafColumns.filter(visibleColumns)
          , block = createCellBlock(rows)

      block.measuredWidth = columns.measuredWidth
      block.measuredHeight = rows.measuredHeight
      block.left = l
      block.right = r
      block.width = w
      block.top = t
      block.bottom = b
      block.height = h
      block.className = className
      block.scrollTop = sV ? scrollTop : undefined
      block.scrollLeft = sH ? scrollLeft : undefined
      block.visibleCellsHash = visibleLeafColumns.reduce(orderHash, '')
      block.columns = columns
      block.isVerticalShort = rows.isVerticalShort
      block.isHorizontalShort = columns.isHorizontalShort

      if (sH) {
        block.actualWidth = columns.actualWidth
        block.isScrolledLeft = columns.isScrolledLeft
        block.isScrolledRight = columns.isScrolledRight
      }

      if (sV) {
        block.actualHeight = actualHeight
        block.isScrolledTop = rows.isScrolledTop
        block.isScrolledBottom = rows.isScrolledBottom
      }

      return block

      function createCellBlock(rows) {
        const result = []

        let cells
          , i = minRowIndex
          , row

        if (!columns.length) return result

        for (;i <= maxRowIndex; i++) {
          row = rows[i]
          cells = row ? createCells(rows[i], i) : null
          if (cells) result.push(cells)
        }

        return result
      }

      function createCells(row, i, a) {
        const top = i * rowHeight
            , cells = visibleLeafColumns.map(valueFromRow)

        cells.id = rowKey ? rowKey(row) : i
        cells.index = i
        cells.top = top
        cells.columns = columns
        cells.row = row
        cells.rows = d.rows

        return cells

        function valueFromRow(column, i, a) {

          return {
            id: column.id
          , column: column
          , row: row
          , value: column.value(row)
          , isFirst: i == 0
          , isLast: i + 1 == a.length
          }
        }
      }

      function visibleColumns(c) {
        let left
          , right

        if (c.hidden) return false
        if (!virtualizeColumns) return true
        if (c.locked) return true
        if (!sH) return true

        left = c.absoluteOffset - scrollLeft
        right = left + c.width
        return right > 0 && left < columns.actualWidth
        return (right > 100 && left + 100 < columns.actualWidth)
      }
    }
  }

  bodyBlockLayout.virtualizeRows = function(value) {
    if (!arguments.length) return virtualizeRows
    virtualizeRows = value
    return bodyBlockLayout
  }

  bodyBlockLayout.virtualizeColumns = function(value) {
    if (!arguments.length) return virtualizeColumns
    virtualizeColumns = value
    return bodyBlockLayout
  }

  bodyBlockLayout.rowKey = function(value) {
    if (!arguments.length) return rowKey
    rowKey = value
    return bodyBlockLayout
  }

  return bodyBlockLayout
}

function orderHash(previous, current) {
  return (
    (previous ? previous + '※' : '')
  + current.id
  + (current.children ? '(' + current.children.reduce(orderHash, '')+ ')' : '')
  )
}
