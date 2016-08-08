import { appendFromTemplate, selectionChanged, createDispatchCustomEvent, rebind } from '@zambezi/d3-utils'
import { createColumnSizerLayout } from './column-sizer-layout'
import { debounce } from 'underscore'
import { easeLinear } from 'd3-ease'
import { select, mouse } from 'd3-selection'
import { timer } from 'd3-timer'
import { transition } from 'd3-transition'

import './column-sizers.css'
const dispatchRedraw = createDispatchCustomEvent().type('redraw')
    , appendSizer = appendFromTemplate('<li class="zambezi-grid-resizer"></li>')

export function createColumnSizers() {

  const minColumnWidth = 20
      , minFreeColumnWidth = 30
      , changed = selectionChanged().key(leftAndNested)
      , columnSizerLayout = createColumnSizerLayout()
      , api = rebind().from(columnSizerLayout, 'resizeColumnsByDefault')

  let resizingSizer
    , resizingPosition

  function columnSizers(s) {
    s.each(columnSizersEach)
  }

  return api(columnSizers)

  function columnSizersEach(d, i) {
    const target = select(this)
        , bundle = d
        , componentId = target.attr('id')
        , columns = bundle.columns
        , include = {}
        , resizingId = resizingPosition && resizingPosition.id
        , positions = columnSizerLayout
              .include(
                resizingId && (include[resizingId] = true, include)
              )(bundle)
        , list = target
              .select('.zambezi-grid-resizers')
              .classed('zambezi-grid-overlay', true)
        , listNode = list.node()

        , sizersUpdate = list.selectAll('.zambezi-grid-resizer').data(positions)
        , sizersEnter = sizersUpdate.enter().select(appendSizer)
        , sizersExit = sizersUpdate.exit()
              .classed('is-recycled', true)
              .on('mousedown.column-sizers', null)
            .transition()
              .duration(3000) // keep them for a few seconds, might be picked
                              // up again soon.
              .remove()       // ... remove if they haven't.
        , sizers = sizersUpdate.merge(sizersEnter)

    sizers.on('mousedown.column-sizers', onSizerMousedown)
    sizers.filter('.is-recycled')
        .classed('is-recycled', false)
        .interrupt() // cancel removal if recycled.

    sizers.select(changed)
        .classed('is-nested', isNested)
        .style('left', d => d.left + 'px')


    function onSizerMousedown(d, i) {
      resizingSizer = select(this)
          .classed('is-dragging', true)

      resizingPosition = d

      if (d.locked == 'right') {
        resizingPosition.originalWidth = d.column.width
        resizingPosition.startDragX = mouseX()
      }

      list.classed('is-dragging', true)
      select(window).on('mousemove.column-sizers', onMouseDrag)
      select(window).on('mouseup.column-sizers', stopDragging)
    }

    function mouseX() {
      return mouse(listNode)[0]
    }

    function onMouseDrag() {
      const x = mouseX()
          , column = resizingPosition.column
          , width = resizingPosition.locked == 'right'
            ? (resizingPosition.startDragX - x)
                + resizingPosition.originalWidth
            : x - column.absoluteOffset - resizingPosition.offset

          , newWidth = Math.max(width , minColumnWidth)
          , candidateFreeWidth = findCandidateFreeWidth()

      column.manuallyResized = true

      if (findCandidateFreeWidth() < minFreeColumnWidth) return

      column.width = newWidth
      target.each(dispatchRedraw)

      function findCandidateFreeWidth() {

        const locked = resizingPosition.locked

        let freeWidth = bundle.bodyBounds.width - (
              locked == 'right' ? (
                columns.left.measuredWidth
              + columns.right.reduce(addMinusSelected, 0)
              + newWidth
              )
            : locked == 'left' ? (
                columns.right.measuredWidth
              + columns.left.reduce(addMinusSelected, 0)
              + newWidth
              )
            : columns.right.measuredWidth + columns.left.measuredWidth
            )

        if (bundle.bodyBounds.clippedVertical) freeWidth -= bundle.scrollerWidth
        return freeWidth
      }

      function addMinusSelected(p, c) {
        return p + (c.id !== resizingPosition.id ? c.width : 0)
      }
    }

    function stopDragging() {
      list.classed('is-dragging', false)
      select(window).on('mousemove.column-sizers', null)
          .on('mouseup.column-sizers', null)

      resizingPosition = null
      resizingSizer.classed('is-dragging', false)
      resizingSizer = null
    }
  }
}


function isNested(d, i) {
  const column = d.column

  if (!column.isChild) return false

  return d.locked == 'right' ?
      column.childIndex > 0
    : column.childIndex < column.childTotal - 1
}

function leftAndNested(d) {
  return d.left + (isNested(d) ? '✓' : '✗')
}
