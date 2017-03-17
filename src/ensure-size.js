import { selectionChanged, appendIfMissing } from '@zambezi/d3-utils'
import { functor } from '@zambezi/fun'
import { isUndefined } from 'underscore'
import { select } from 'd3-selection'

import './ensure-size.css'

const appendAnchor = appendIfMissing('div.zambezi-scroll-anchor')

export function createEnsureSize () {
  const topChanged = selectionChanged()
  const leftChanged = selectionChanged()

  let targetHeight
  let targetWidth

  function ensureSize (s) {
    s.each(ensureSizeEach)
  }

  ensureSize.targetHeight = function (value) {
    if (!arguments.length) return targetHeight
    targetHeight = value
    return ensureSize
  }

  ensureSize.targetWidth = function (value) {
    if (!arguments.length) return targetWidth
    targetWidth = value
    return ensureSize
  }

  return ensureSize

  function ensureSizeEach (d, i) {
    const anchor = select(this).select(appendAnchor)
    const top = px(targetHeight, -10)
    const left = px(targetWidth, -10)

    topChanged.key(functor(top || '×'))
    leftChanged.key(functor(left || '×'))

    anchor.select(topChanged).style('top', top)
    anchor.select(leftChanged).style('left', left)
  }

  function px (value, offset) {
    if (isUndefined(value)) return null
    return value + offset + 'px'
  }
}
