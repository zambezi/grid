import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGridSheet } from './grid-sheet'
import { property } from '@zambezi/fun'
import { select } from 'd3-selection'
import { selectionChanged, appendIfMissing } from '@zambezi/d3-utils'

import './scrollers.css'

const verticalScrollChanged = selectionChanged()
    , horizontalScrollChanged = selectionChanged()
    , clippingChanged = selectionChanged()
    , scrollTop = property('scroll.top')
    , scrollLeft = property('scroll.left')
    , appendScrollerContent = appendIfMissing('div.scroller-content')

export function createScrollers() {

  const sheet = createGridSheet()

  let sizeValidationRound = 0

  function scrollers(s) {
    s.each(scrollersEach)
        .on('size-dirty.scroller-invalidation', () => sizeValidationRound++)
  }

  return scrollers

  function scrollersEach(bundle, i) {
    const root = select(this)
        , rows = bundle.rows
        , bodyBounds = bundle.bodyBounds
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
          .datum(scrollTop)
          .property('scrollTop', parseFloat)

      horizontal.select(horizontalScrollChanged)
          .datum(scrollLeft)
          .property('scrollLeft', parseFloat)
    }

    function updateContentRules() {
      const top = px(rows.top.measuredHeight)
          , bottom = px(rows.bottom.measuredHeight + (bodyBounds.clippedHorizontal ? bundle.scrollerWidth : 0))
          , height = px(rows.free.measuredHeight)
          , selectorVScroller = `#${ id } .v-scroller`
          , selectorVContent = selectorVScroller + ' .scroller-content'

          , left = px(bundle.columns.left.measuredWidth)
          , right = px(bundle.columns.right.measuredWidth
                + (bodyBounds.clippedVertical ? bundle.scrollerWidth : 0)
                )

          , width = px(bundle.columns.free.measuredWidth)
          , selectorHScroller = `#${ id } .h-scroller`
          , selectorHContent = selectorHScroller + ' .scroller-content'

      sheet(selectorVScroller, { top,  bottom  })
      sheet(selectorVContent, { height })
      sheet(selectorHScroller, { left,  right })
      sheet(selectorHContent, { width })
    }

    function onScroll() {
      const top = vertical.property('scrollTop')
          , left = horizontal.property('scrollLeft')

      select(this)
          .dispatch('grid-scroll', { bubbles: true, detail: { top, left } })
          .dispatch('redraw', { bubbles: true })
    }

    function verticalScrollChangedKey() {
      return `${ bundle.scroll.top } v ${ bundle.rows.free.measuredHeight } R ${ sizeValidationRound}`
    }

    function horizontalScrollChangedKey() {
      return `${ bundle.scroll.left } h ${ bundle.columns.free.measuredWidth } R ${ sizeValidationRound }`
    }

    function clippingChangedKey() {
      return `${ bundle.bodyBounds.clippedHorizontal }: ${ bundle.bodyBounds.clippedVertical } ${ sizeValidationRound}`
    }
  }
}
