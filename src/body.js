import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createBodyBlockLayout } from './body-block-layout'
import { createCells } from './cells'
import { createEnsureSize } from './ensure-size'
import { createGridSheet } from './grid-sheet'
import { dispatch as createDispatch } from 'd3-dispatch'
import { format } from 'd3-format'
import { functor } from '@zambezi/fun'
import { isUndefined, isEqual } from 'underscore'
import { property } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged, rebind, redispatch } from '@zambezi/d3-utils'

import './body.css'

const sides = [ 'left', 'right', 'width', 'top', 'bottom', 'height' ]
    , verticalScrollChanged = selectionChanged()
    , horizontalScrollChanged = selectionChanged()
    , isScrolledLeft = property('isScrolledLeft')
    , isScrolledRight = property('isScrolledRight')
    , isScrolledTop = property('isScrolledTop')
    , isScrolledBottom = property('isScrolledBottom')
    , isVerticalShort = property('isVerticalShort')
    , isHorizontalShort = property('isHorizontalShort')
    , formatSingleDigitPrecision = format('.1f')
    , formatInteger = format('.0f')

export function createBody() {

  const cells = createCells()
      , sheet = createGridSheet()
      , bodyBlockLayout = createBodyBlockLayout()
      , dispatch = createDispatch('visible-lines-change')
      , redispatcher = redispatch()
            .from(dispatch, 'visible-lines-change')
            .from(
              cells
            , 'cell-enter'
            , 'cell-exit'
            , 'cell-update'
            , 'row-changed'
            , 'row-enter'
            , 'row-exit'
            , 'row-update'
            )
            .create()

      , ensureSize = createEnsureSize()
      , api = rebind()
            .from(cells, 'rowChangedKey', 'rowKey')
            .from(bodyBlockLayout, 'virtualizeRows', 'virtualizeColumns')
            .from(redispatcher, 'on')

  let sizeValidationRound = 0

  let lastOnChangeArgs

  function body(s) {
    bodyBlockLayout.rowKey(cells.rowKey())
    s.each(bodyEach).on('size-dirty', () => sizeValidationRound++)
  }

  return api(body)

  function bodyEach(d, i) {
    const bundle = d
        , root = select(this)
        , target = root.select('.zambezi-grid-body')
        , id = root.attr('id')
        , blockData = bodyBlockLayout(bundle)
        , blocksUpdate = target.selectAll('.zambezi-body-section')
              .data(blockData)
        , blocksEnter = blocksUpdate.enter()
              .append('ul')
                .classed('zambezi-body-section', true)
                .each(setSectionClasses)
        , blocks = blocksUpdate.merge(blocksEnter)
        , rows = bundle.rows
        , bodyBounds = bundle.bodyBounds
        , verticalScroll = scrollChanged(bundle.scroll.top, sizeValidationRound)
        , horizontalScroll = scrollChanged(bundle.scroll.left, sizeValidationRound)
        , updateLinesChange = onChange(dispatchLinesChange)

    updateRowHeightStyles()
    updateBlocksAndCells()
    updateScroll()

    bundle.columns.forEach(updateColumnLayout)

    updateLinesChange(
      blockData.minVisibleFreeRow
    , blockData.maxVisibleFreeRow
    )

    function updateBlocksAndCells() {
      blocks.each(updateBlockLayout)
          .call(cells.sheet(sheet).gridId(id))
    }

    function dispatchLinesChange(min, max) {
      dispatch.call('visible-lines-change', this, min, max)
    }

    function updateScroll() {
      blocks.classed('is-vertical-short', isVerticalShort)
          .classed('is-horizontal-short', isHorizontalShort)
          .classed('is-scrolled-down', isScrolledTop)
          .classed('is-scrolled-up', isScrolledBottom)
          .select(verticalScrollChanged.key(verticalScroll))
          .each(updateVerticalScroll)

      blocks.classed('is-scrolled-left', isScrolledLeft)
          .classed('is-scrolled-right' , isScrolledRight)
          .select(
            horizontalScrollChanged.key(horizontalScroll)
          )
          .each(updateHorizontalScroll)
    }

    function updateRowHeightStyles() {
      sheet(
        `#${id} .zambezi-grid-cell, #${id} .zambezi-grid-row`
      , { height: px(bundle.rowHeight) }
      )
    }

    function updateColumnLayout(column) {
      sheet(
        `#${ id } .c-${ column.id }`
      , {
          width: px(column.width)
        , left: px(column.absoluteOffset)
        }
      )
      if (!column.children) return
      column.children.forEach(updateColumnLayout)
    }

    function updateBlockLayout(d, i) {
      const blockSelector = `#${ id } .zambezi-body-section.${ d.className }`
          , value = {}
          , rowSelector = blockSelector + ' > .zambezi-grid-row'
          , measuredWidth = d.measuredWidth
          , measuredHeight = d.measuredHeight
          , minWidth = px(Math.max(d.actualWidth || 0, measuredWidth))
          , forceSizeTarget = select(
              (!isUndefined(d.scrollTop) || !isUndefined(d.scrollLeft))
            && this
            )
            .call(
              ensureSize.targetHeight(measuredHeight)
                  .targetWidth(measuredWidth)
            )

      sheet(rowSelector, { minWidth: minWidth })
      sides.forEach(setSide)
      sheet(blockSelector, value)

      function setSide(side) {
        if (isUndefined(d[side])) return
        value[side] = px(d[side])
      }
    }

    function scrollChanged(scroll, validationId) {
      return functor(
        `
        ${ bodyBounds.width }
        ▓
        ${ bodyBounds.height }
        ▒
        ${ rows.top.length }
        ▓
        ${ rows.free.length }
        ▓
        ${ rows.bottom.length }
        ▓
        ${ scroll }
        ∵
        ${ validationId }
        `
      )
    }

    function onChange(func) {
      return function change() {
        if (isEqual(arguments, lastOnChangeArgs)) return
        lastOnChangeArgs = arguments
        func.apply(this, arguments)
      }
    }

    function updateVerticalScroll(d, i) {
      if (isUndefined(d.scrollTop)) return
      select(this).property('scrollTop', d.scrollTop)
    }

    function updateHorizontalScroll(d, i) {
      if (isUndefined(d.scrollLeft)) return
      select(this).property('scrollLeft', d.scrollLeft)
    }

    function setSectionClasses(d, i) {
      select(this).classed(d.className, true)
    }
  }
}
