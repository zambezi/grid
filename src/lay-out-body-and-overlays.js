import { basicPrecisionPxFormatter as px } from './basic-precision-px-formatter'
import { createGridSheet } from './grid-sheet'
import { select } from 'd3-selection'

import './lay-out-body-and-overlays.css'

export function createLayOutBodyAndOverlays () {
  const sheet = createGridSheet()

  function layOutBodyAndOverlays (d, i) {
    const target = select(this),
      id = target.attr('id'),
      bodyBounds = d.bodyBounds,
      headersBounds = d.headersBounds

    sheet(
      `#${id} .zambezi-grid-body`
    , {
      width: px(bodyBounds.width),
      height: px(bodyBounds.height)
    }
    )

    sheet(
      `#${id} .zambezi-grid-body-overlay`
    , { top: px(bodyBounds.offsetTop) }
    )

    if (!headersBounds) return

    sheet(
      `#${id} .zambezi-grid-headers-overlay`
    , { top: px(headersBounds.offsetTop) }
    )

    sheet(
      `#${id} .zambezi-grid-overlay`
    , { top: px(headersBounds.offsetTop) }
    )
  }

  return layOutBodyAndOverlays
}
