import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createBodyBlockLayout } from './body-block-layout'
import { createCells } from './cells'
import { createGridSheet } from './grid-sheet'
import { dispatch as createDispatch } from 'd3-dispatch'
import { isUndefined, isEqual } from 'underscore'
import { rebind, redispatch } from '@zambezi/d3-utils'
import { select } from 'd3-selection'

import './body.css'

const sides = [ 'left', 'right', 'width', 'top', 'bottom', 'height' ]

export function createBody () {
  const cells = createCells()
  const sheet = createGridSheet()
  const bodyBlockLayout = createBodyBlockLayout()
  const dispatch = createDispatch('visible-lines-change')

  const redispatcher = redispatch()
            .from(dispatch, 'visible-lines-change')
            .from(
              cells,
              'cell-enter',
              'cell-exit',
              'cell-update',
              'row-changed',
              'row-enter',
              'row-exit',
              'row-update'
            )
            .create()

  const api = rebind()
            .from(cells, 'rowChangedKey', 'rowKey')
            .from(bodyBlockLayout, 'virtualizeRows', 'virtualizeColumns')
            .from(redispatcher, 'on')

  let sizeValidationRound = 0
  let lastOnChangeArgs

  function body (s) {
    bodyBlockLayout.rowKey(cells.rowKey())
    s.each(bodyEach).on('size-dirty', () => sizeValidationRound++)
  }

  return api(body)

  function bodyEach (d, i) {
    const bundle = d
    const root = select(this)
    const target = root.select('.zambezi-grid-body')
    const id = root.attr('id')
    const blockData = bodyBlockLayout(bundle)
    const blocksUpdate = target.selectAll('.zambezi-body-section')
                  .data(blockData)
    const blocksEnter = blocksUpdate.enter()
                  .append('ul')
                    .classed('zambezi-body-section', true)
                    .each(setSectionClasses)

    const blocks = blocksUpdate.merge(blocksEnter)
    const updateLinesChange = onChange(dispatchLinesChange)

    updateRowHeightStyles()
    updateBlocksAndCells()
    updateScrollTransform()

    bundle.columns.forEach(updateColumnLayout)

    updateLinesChange(
      blockData.minVisibleFreeRow,
      blockData.maxVisibleFreeRow
    )

    function updateBlocksAndCells () {
      blocks.each(updateBlockLayout)
          .call(cells.sheet(sheet).gridId(id))
    }

    function updateScrollTransform () {
      const formatLeft = px(-bundle.scroll.left)
      const formatTop = px(-bundle.scroll.top)

      sheet(
        `
        #${id} .zambezi-body-section.body-e > .zambezi-grid-row
        `,
        { transform: `translate(${formatLeft}, ${formatTop})` }

      )

      sheet(
        `
        #${id} .zambezi-body-section.body-d > .zambezi-grid-row,
        #${id} .zambezi-body-section.body-f > .zambezi-grid-row
        `
      , { transform: `translateY(${formatTop})` }
      )

      sheet(
        `
        #${id} .zambezi-body-section.body-b > .zambezi-grid-row,
        #${id} .zambezi-body-section.body-h > .zambezi-grid-row
        `
      , { transform: `translateX(${formatLeft})` }
      )
    }

    function dispatchLinesChange (min, max) {
      dispatch.call('visible-lines-change', this, min, max)
    }

    function updateRowHeightStyles () {
      sheet(
        `#${id} .zambezi-grid-cell, #${id} .zambezi-grid-row`
      , { height: px(bundle.rowHeight) }
      )
    }

    function updateColumnLayout (column) {
      sheet(
        `#${id} .c-${column.id}`
      , {
        width: px(column.width),
        left: px(column.absoluteOffset)
      }
      )
      if (!column.children) return
      column.children.forEach(updateColumnLayout)
    }

    function updateBlockLayout (d, i) {
      const blockSelector = `#${id} .zambezi-body-section.${d.className}`
      const value = {}
      const rowSelector = blockSelector + ' > .zambezi-grid-row'
      const measuredWidth = d.measuredWidth
      const minWidth = px(Math.max(d.actualWidth || 0, measuredWidth))

      sheet(rowSelector, { minWidth: minWidth })
      sides.forEach(setSide)
      sheet(blockSelector, value)

      function setSide (side) {
        if (isUndefined(d[side])) return
        value[side] = px(d[side])
      }
    }

    function onChange (func) {
      return function change () {
        if (isEqual(arguments, lastOnChangeArgs)) return
        lastOnChangeArgs = arguments
        func.apply(this, arguments)
      }
    }

    function setSectionClasses (d, i) {
      select(this).classed(d.className, true)
    }
  }
}
