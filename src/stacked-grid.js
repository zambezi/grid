import { select } from 'd3-selection'
import { unwrap } from './unwrap-row'
import { appendIfMissing, each, rebind } from '@zambezi/d3-utils'
import { createGrid } from './grid'
import './stacked-grid.css'

export function createStackedGrid() {
  const gridPool = []
      , masterGrid = createGrid()
            .useAfterMeasure(each(sliceDataForSlaveGrids))
      , appendMaster = appendIfMissing('div.grid-page.master-grid')
      , api = rebind().from(masterGrid, 'columns')

  let targetPageWidth = '500px'

  function stackedGrid(s) {
    s.each(stackedGridEach)
  }

  stackedGrid.targetPageWidth = function(value) {
    if (!arguments.length) return targetPageWidth
    targetPageWidth = value
    return stackedGrid
  }

  return api(stackedGrid)

  function stackedGridEach(d, i) {
    const target = select(this)
            .classed('zambezi-stacked-grid', true)

    target.select(appendMaster).style('width', pageWidth).call(masterGrid)
  }

  function pageWidth() {
    const columns = masterGrid.columns()
    if (!columns) return targetPageWidth
    if (!columns.every( col => !!col.width)) return targetPageWidth
    return `${columns.reduce((acc, col) => acc + col.width, 0)}px`
  }

  function sliceDataForSlaveGrids(d) {
    const { rowHeight, bodyBounds, scrollerWidth } = d
        , rowsPerPage = Math.floor((bodyBounds.height - scrollerWidth) / rowHeight)
        , chunks = d.rows.reduce(toChunks, [])
        , targetMaster = select(this)

    d.rows.free = chunks.shift()

    const update = target.selectAll('.grid-page.slave-grid')
            .data(chunks)
        , enter = update.enter()
            .append('div')
      .style('width', '400px')
              .classed('grid-page slave-grid', true)

    update.exit().remove()

    update.merge(enter).each(drawGridSlavePage)
    gridPool.length = chunks.length

    function toChunks(acc, next, i) {
      const chunkIndex = Math.floor(i / rowsPerPage)
          , modIndex = i % rowsPerPage
          , chunk = acc[chunkIndex] || []

      chunk[modIndex] = (chunkIndex === 0) ? next : unwrap(next)
      acc[chunkIndex] = chunk

      return acc
    }

    function drawGridSlavePage(d, i) {
      const grid = gridPool[i] || createGrid()

      select(this).call(
        grid.serverSideFilterAndSort(true)
          .columns(masterGrid.columns())
          .on('sort-changed.stacked-grid',
            () => {
              targetMaster
                .dispatch('data-dirty', { bubbles: true })
                .dispatch('redraw', { bubbles: true })
            }
          )
      )
      gridPool[i] = grid
    }
  }
}
