import { appendIfMissing } from '@zambezi/d3-utils'
import { select } from 'd3-selection'
import { styleForSelector } from './style-for-selector'

const styleBySelector = {}
let sheet

export function createGridSheet () {
  function gridSheet (selector, value) {
    gridSheet.setStyle(selector, value)
  }

  gridSheet.setStyle = function (selector, values) {
    confirmSheetAndId()

    const style = styleFor(selector)

    Object.keys(values).forEach(setStyle)

    function setStyle (key) {
      const value = values[key]
      if (style[key] === value) return
      style[key] = value
    }
  }

  return gridSheet
}

function confirmSheetAndId () {
  sheet || (sheet = createSheet())
}

function createSheet () {
  return select('head')
            .select(appendIfMissing('style.zambezi-grid-styles'))
              .property('sheet')
}

function styleFor (fullSelector) {
  let style = styleBySelector[fullSelector]
  if (style) return style
  style = styleForSelector(fullSelector, sheet)
  styleBySelector[fullSelector] = style
  return style
}
