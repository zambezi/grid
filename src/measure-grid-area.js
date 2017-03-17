import { createGridSheet } from './grid-sheet'
import { pick } from 'underscore'
import { select } from 'd3-selection'

export function createMeasureGridArea () {
  const sheet = createGridSheet()
  let bounds,
    bodyBounds,
    headersBounds

  function measureGridArea (s) {
    s.on('size-dirty.measure-grid-body', onSizeDirty)
      .each(measureGridAreaEach)
  }

  return measureGridArea

  function measureGridAreaEach (d, i) {
    const target = select(this)
    if (!bounds) measure()

    d.gridBounds = bounds
    d.bodyBounds = bodyBounds
    d.headersBounds = headersBounds

    function measure () {
      measureGrid()
      checkBoundsValid()
      syncStirrupSize()
      measureBody()
      measureHeaders()
    }

    function measureGrid () {
      bounds = pick(
        target.node().getBoundingClientRect()
      , 'width'
      , 'height'
      )
    }

    function syncStirrupSize () {
      sheet(
        `#${target.attr('id')} > .zambezi-grid-stirrup`
      , {
        width: bounds.width + 'px',
        height: bounds.height + 'px'
      }
      )
    }

    function measureBody () {
      const body = target.select('.zambezi-grid-body'),
        offsetTop = body.node().offsetTop

      bodyBounds = {
        height: bounds.height - offsetTop,
        width: bounds.width,
        offsetTop: offsetTop
      }
    }

    function measureHeaders () {
      const headers = target.select('.zambezi-grid-headers')
      let headersNode,
        offsetTop,
        bounds

      if (headers.empty()) return

      headersNode = headers.node()
      offsetTop = headersNode.offsetTop
      bounds = headersNode.getBoundingClientRect()

      headersBounds = {
        width: bounds.width,
        height: bounds.height,
        offsetTop: offsetTop
      }
    }

    function checkBoundsValid () {
      if (bounds.width == 0 || bounds.height == 0) {
        console.error('Illegal size for grid', bounds, target.node())
      }
    }
  }

  function onSizeDirty () {
    bounds = null
    bodyBounds = null
    headersBounds = null
  }
}
