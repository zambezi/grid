import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGridSheet } from './grid-sheet'
import { property } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged, appendIfMissing } from '@zambezi/d3-utils'

import './scrollers.css'

const verticalScrollChanged = selectionChanged()
    , clippingChanged = selectionChanged()
    , horizontalScrollChanged = selectionChanged()
    , scrollTop = property('scroll.top')
    , scrollLeft = property('scroll.left')
    , appendScrollerContent = appendIfMissing('div.scroller-content')

export function createScrollers() {

  const sheet = createGridSheet()

  function scrollers(s) {
    s.each(scrollersEach)
  }

  return scrollers

  function scrollersEach(bundle, i) {
    const rows = bundle.rows
        , bodyBounds = bundle.bodyBounds
        , root = select(this)
        , id = root.attr('id')
        , target = root.select('.zambezi-grid-body')
        , vertical = target.select(appendIfMissing('div.v-scroller'))
              .on('scroll.scrollers', onScroll)
        , horizontal = target.select(appendIfMissing('div.h-scroller'))
              .on('scroll.scrollers', onScroll)

    verticalScrollChanged.key(verticalScrollChangedKey)
    horizontalScrollChanged.key(horizontalScrollChangedKey)
    clippingChanged.key(clippingChangedKey)

    vertical.select(appendScrollerContent)
    horizontal.select(appendScrollerContent)

    updateClipping()
    updateContentRules()
    updateScroll()

    function updateClipping() {
      root.select(clippingChanged)
          .classed('is-cropped-h', bodyBounds.clippedHorizontal)
          .classed('is-cropped-v', bodyBounds.clippedVertical)
    }

    function updateScroll() {
      vertical
          .select(verticalScrollChanged)
          .property('scrollTop', parseFloat)

      horizontal.select(horizontalScrollChanged)
          .property('scrollLeft', parseFloat)
    }

    function updateContentRules() {
      const top = px(rows.top.measuredHeight)
          , bottom = px(rows.bottom.measuredHeight + (bodyBounds.clippedHorizontal ? bundle.scrollerWidth : 0))
          , height = px(rows.free.measuredHeight)
          , selectorVScroller = '#' + id + ' .v-scroller'
          , selectorVContent = selectorVScroller + ' .scroller-content'

          , left = px(bundle.columns.left.measuredWidth)
          , right = px(bundle.columns.right.measuredWidth
                + (bodyBounds.clippedVertical ? bundle.scrollerWidth : 0)
                )

          , width = px(bundle.columns.free.measuredWidth)
          , selectorHScroller = '#' + id + ' .h-scroller'
          , selectorHContent = selectorHScroller + ' .scroller-content'

      sheet(selectorVScroller, { top: top ,  bottom: bottom })
      sheet(selectorVContent, { height: height })
      sheet(selectorHScroller, { left: left ,  right: right })
      sheet(selectorHContent, { width: width })
    }

    function onScroll() {
      console.log(
        {
          top: vertical.property('scrollTop')
        , left: horizontal.property('scrollLeft')
        }
      )
    }

    function verticalScrollChangedKey() {
      return bundle.scroll.top + 'v' + bundle.rows.free.measuredHeight
    }

    function horizontalScrollChangedKey() {
      return bundle.scroll.left + 'h' + bundle.columns.free.measuredWidth
    }

    function clippingChangedKey() {
      return bundle.bodyBounds.clippedHorizontal + ':' + bundle.bodyBounds.clippedVertical
    }
  }
}
