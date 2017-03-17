export function createBodyBlockLayout () {
  let virtualizeRows = true
  let virtualizeColumns = true
  let rowKey

  function bodyBlockLayout (d) {
    const scrollerWidth = d.scrollerWidth
    const bounds = d.bodyBounds
    const rowHeight = d.rowHeight
    const rowT = d.rows.top
    const rowF = d.rows.free
    const rowB = d.rows.bottom
    const colL = d.columns.left
    const colF = d.columns.free
    const colR = d.columns.right
    const clw = colL.measuredWidth
    const crw = colR.measuredWidth
    const rth = rowT.measuredHeight
    const rbh = rowB.measuredHeight
    const freeR = bounds.clippedVertical ? crw + scrollerWidth : crw
    const freeB = bounds.clippedHorizontal ? rbh + scrollerWidth : rbh
    const scrollTop = d.scroll.top
    const scrollLeft = d.scroll.left
    const minVisibleFreeRow = Math.floor(scrollTop / rowHeight)
    const maxVisibleFreeRow = Math.floor(
                (scrollTop + rowF.actualHeight) / rowHeight
              )
    const layout = [

          /* eslint-disable */

          // class    rows  cols  l     r      w     t     b       h    sV  sH
          [ 'body-a', rowT, colL ,     ,      ,clw  ,     ,       ,rth     ,   ],
          [ 'body-b', rowT, colF ,clw  ,freeR ,     ,     ,       ,rth ,   ,1  ],
          [ 'body-c', rowT, colR ,     ,      ,crw  ,     ,       ,rth ,   ,   ],

          [ 'body-d', rowF, colL ,     ,      ,clw  ,rth  ,freeB  ,    ,1  ,   ],
          [ 'body-e', rowF, colF ,clw  ,freeR ,     ,rth  ,freeB  ,    ,1  ,1  ],
          [ 'body-f', rowF, colR ,     ,      ,crw  ,rth  ,freeB  ,    ,1  ,   ],

          [ 'body-g', rowB, colL ,     ,      ,clw  ,     ,       ,rbh ,   ,   ],
          [ 'body-h', rowB, colF ,clw  ,freeR ,     ,     ,       ,rbh ,   ,1  ],
          [ 'body-i', rowB, colR ,     ,      ,crw  ,     ,       ,rbh ,   ,   ]

          /* eslint-enable */

    ].map(buildBlockData)

    layout.minVisibleFreeRow = minVisibleFreeRow
    layout.maxVisibleFreeRow = maxVisibleFreeRow

    return layout

    function buildBlockData (config, i) {
      return buildBlockRows.apply(null, [i].concat(config))
    }

    function buildBlockRows (index, className, rows, columns, l, r, w, t, b, h, sV, sH) {
      const actualHeight = rows.actualHeight
      const lastRowIndex = rows.length - 1
      const cullDataRows = sV && virtualizeRows
      const minRowIndex = cullDataRows ? minVisibleFreeRow : 0
      const maxRowIndex = cullDataRows ? Math.min(lastRowIndex, maxVisibleFreeRow) : lastRowIndex
      const visibleLeafColumns = columns.leafColumns.filter(visibleColumns)
      const block = createCellBlock(rows)

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

      function createCellBlock (rows) {
        const result = []

        let cells
        let i = minRowIndex
        let row

        if (!columns.length) return result

        for (;i <= maxRowIndex; i++) {
          row = rows[i]
          cells = row ? createCells(rows[i], i) : null
          if (cells) result.push(cells)
        }

        return result
      }

      function createCells (row, i, a) {
        const top = i * rowHeight
        const cells = visibleLeafColumns.map(valueFromRow)

        cells.id = rowKey ? rowKey(row) : i
        cells.index = i
        cells.top = top
        cells.columns = columns
        cells.row = row
        cells.rows = d.rows

        return cells

        function valueFromRow (column, i, a) {
          return {
            id: column.id,
            column: column,
            row: row,
            value: column.value(row),
            isFirst: i === 0,
            isLast: i + 1 === a.length
          }
        }
      }

      function visibleColumns (c) {
        let left,
          right

        if (c.hidden) return false
        if (!virtualizeColumns) return true
        if (c.locked) return true
        if (!sH) return true

        left = c.absoluteOffset - scrollLeft
        right = left + c.width
        return right > 0 && left < columns.actualWidth
      }
    }
  }

  bodyBlockLayout.virtualizeRows = function (value) {
    if (!arguments.length) return virtualizeRows
    virtualizeRows = value
    return bodyBlockLayout
  }

  bodyBlockLayout.virtualizeColumns = function (value) {
    if (!arguments.length) return virtualizeColumns
    virtualizeColumns = value
    return bodyBlockLayout
  }

  bodyBlockLayout.rowKey = function (value) {
    if (!arguments.length) return rowKey
    rowKey = value
    return bodyBlockLayout
  }

  return bodyBlockLayout
}

function orderHash (previous, current) {
  return (
    (previous ? previous + '※' : '') + current.id + (current.children ? '(' +
        current.children.reduce(orderHash, '') + ')' : '')
  )
}
