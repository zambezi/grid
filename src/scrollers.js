import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGridSheet } from './grid-sheet'
import { dispatch as createDispatch } from 'd3-dispatch'
import { property } from '@zambezi/fun'
import { select } from 'd3-selection'
import { debounce } from 'underscore'
import { selectionChanged, appendIfMissing } from '@zambezi/d3-utils'

import './scrollers.css'

const scrollLeft = property('scroll.left')
const appendScrollerContent = appendIfMissing('div.scroller-content')

export function createScrollers () {
  const verticalScrollChanged = selectionChanged()
  const horizontalScrollChanged = selectionChanged()
  const clippingChanged = selectionChanged()
  const sheet = createGridSheet()
  const internalDispatcher = createDispatch('consolidate')
  const trackLastUpdate = debounce(() => internalDispatcher.call('consolidate'), 10)

  let sizeValidationRound = 0
  let isSelfScroll = false
  let isScrollValid

  function scrollers (s) {
    s.each(scrollersEach)
        .on('size-dirty.scroller-invalidation', () => sizeValidationRound++)
        .on('grid-scroll', onGridScroll)
  }

  return scrollers

  function scrollersEach (bundle, i) {
    const root = select(this)
    const rows = bundle.rows
    const bodyBounds = bundle.bodyBounds
    const id = root.attr('id')
    const target = root.select('.zambezi-grid-body')

    const vertical = target.select(appendIfMissing('div.v-scroller'))
              .on('scroll.scrollers', onScroll)

    const horizontal = target.select(appendIfMissing('div.h-scroller'))
              .on('scroll.scrollers', onScroll)

    verticalScrollChanged.key(verticalScrollChangedKey)
    horizontalScrollChanged.key(horizontalScrollChangedKey)
    internalDispatcher.on(`consolidate.${i}`, updateScroll)

    clippingChanged.key(clippingChangedKey)

    vertical.select(appendScrollerContent)
    horizontal.select(appendScrollerContent)

    updateClipping()
    updateContentRules()
    trackLastUpdate()

    function updateClipping () {
      root.select(clippingChanged)
          .classed('is-cropped-h', bodyBounds.clippedHorizontal)
          .classed('is-cropped-v', bodyBounds.clippedVertical)
    }

    function updateScroll () {
      if (isScrollValid) return
      vertical
          .select(verticalScrollChanged)
          .property('scrollTop', bundle.scroll.top)

      horizontal.select(horizontalScrollChanged)
          .datum(scrollLeft)
          .property('scrollLeft', parseFloat)

      isScrollValid = true
    }

    function updateContentRules () {
      const top = px(rows.top.measuredHeight)
      const bottom = px(rows.bottom.measuredHeight +
          (bodyBounds.clippedHorizontal ? bundle.scrollerWidth : 0))

      const height = px(rows.free.measuredHeight)
      const selectorVScroller = `#${id} .v-scroller`
      const selectorVContent = selectorVScroller + ' .scroller-content'

      const left = px(bundle.columns.left.measuredWidth)
      const right = px(bundle.columns.right.measuredWidth +
            (bodyBounds.clippedVertical ? bundle.scrollerWidth : 0))

      const width = px(bundle.columns.free.measuredWidth)
      const selectorHScroller = `#${id} .h-scroller`
      const selectorHContent = selectorHScroller + ' .scroller-content'

      sheet(selectorVScroller, { top, bottom })
      sheet(selectorVContent, { height })
      sheet(selectorHScroller, { left, right })
      sheet(selectorHContent, { width })
    }

    function onScroll () {
      const top = vertical.property('scrollTop')
      const left = horizontal.property('scrollLeft')

      isSelfScroll = true
      select(this)
          .dispatch('grid-scroll', { bubbles: true, detail: { top, left } })
          .dispatch('redraw', { bubbles: true })
      isSelfScroll = false
    }

    function verticalScrollChangedKey () {
      return `${bundle.scroll.top} v ${bundle.rows.free.measuredHeight} R ${sizeValidationRound}`
    }

    function horizontalScrollChangedKey () {
      return `${bundle.scroll.left} h ${bundle.columns.free.measuredWidth} R ${sizeValidationRound}`
    }

    function clippingChangedKey () {
      return `${bundle.bodyBounds.clippedHorizontal}: ${bundle.bodyBounds.clippedVertical} ${sizeValidationRound}`
    }
  }

  function onGridScroll ({scroll}) {
    if (isSelfScroll) return
    isScrollValid = false
  }
}
