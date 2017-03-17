import { appendFromTemplate, selectionChanged, rebind } from '@zambezi/d3-utils'
import { createColumnSizerLayout } from './column-sizer-layout'
import { debounce } from 'underscore'
import { select, mouse } from 'd3-selection'

import { timer } from 'd3-timer'
import { easeLinear } from 'd3-ease'
import { transition } from 'd3-transition'

// Mention for linkage
timer
easeLinear
transition

import './column-sizers.css'

const appendSizer = appendFromTemplate('<li class="zambezi-grid-resizer"></li>')

export function createColumnSizers () {
  const minColumnWidth = 20
  const minFreeColumnWidth = 30
  const changed = selectionChanged().key(leftAndNested)
  const columnSizerLayout = createColumnSizerLayout()
  const api = rebind().from(columnSizerLayout, 'resizeColumnsByDefault')

  let resizingSizer
  let resizingPosition

  function columnSizers (s) {
    s.each(columnSizersEach)
  }

  return api(columnSizers)

  function columnSizersEach (d, i) {
    const target = select(this)
    const bundle = d
    const columns = bundle.columns
    const include = {}
    const resizingId = resizingPosition && resizingPosition.id
    const positions = columnSizerLayout
              .include(
                resizingId && (include[resizingId] = true, include)
              )(bundle)
    const list = target
              .select('.zambezi-grid-resizers')
              .classed('zambezi-grid-overlay', true)
    const listNode = list.node()

    const sizersUpdate = list.selectAll('.zambezi-grid-resizer').data(positions)
    const sizersEnter = sizersUpdate.enter().select(appendSizer)
    const sizers = sizersUpdate.merge(sizersEnter)
    const dispatchSettingsChanged = debounce(
            () => target.dispatch('settings-changed', { bubbles: true })
          , 300
          )

    sizersUpdate.exit()
            .classed('is-recycled', true)
            .on('mousedown.column-sizers', null)
          .transition()
            .duration(3000) // keep them for a few seconds, might be picked
                            // up again soon.
            .remove()       // ... remove if they haven't.

    sizers.on('mousedown.column-sizers', onSizerMousedown)
    sizers.filter('.is-recycled')
        .classed('is-recycled', false)
        .interrupt() // cancel removal if recycled.

    sizers.select(changed)
        .classed('is-nested', isNested)
        .style('left', d => d.left + 'px')

    function onSizerMousedown (d, i) {
      resizingSizer = select(this)
          .classed('is-dragging', true)

      resizingPosition = d

      if (d.locked === 'right') {
        resizingPosition.originalWidth = d.column.width
        resizingPosition.startDragX = mouseX()
      }

      list.classed('is-dragging', true)
      select(window).on('mousemove.column-sizers', onMouseDrag)
      select(window).on('mouseup.column-sizers', stopDragging)
    }

    function mouseX () {
      return mouse(listNode)[0]
    }

    function onMouseDrag () {
      const x = mouseX()
      const column = resizingPosition.column
      const width = resizingPosition.locked === 'right'
            ? (resizingPosition.startDragX - x) + resizingPosition.originalWidth
            : x - column.absoluteOffset - resizingPosition.offset

      const newWidth = Math.max(width, minColumnWidth)
      column.manuallyResized = true

      if (findCandidateFreeWidth() < minFreeColumnWidth) return

      column.width = newWidth
      target.dispatch('redraw')
      dispatchSettingsChanged()

      function findCandidateFreeWidth () {
        const locked = resizingPosition.locked

        let freeWidth = bundle.bodyBounds.width - (
              locked === 'right' ? (
                columns.left.measuredWidth +
                    columns.right.reduce(addMinusSelected, 0) + newWidth
              )
            : locked === 'left' ? (
                columns.right.measuredWidth +
                    columns.left.reduce(addMinusSelected, 0) + newWidth
              )
            : columns.right.measuredWidth + columns.left.measuredWidth
            )

        if (bundle.bodyBounds.clippedVertical) freeWidth -= bundle.scrollerWidth
        return freeWidth
      }

      function addMinusSelected (p, c) {
        return p + (c.id !== resizingPosition.id ? c.width : 0)
      }
    }

    function stopDragging () {
      list.classed('is-dragging', false)
      select(window).on('mousemove.column-sizers', null)
          .on('mouseup.column-sizers', null)

      resizingPosition = null
      resizingSizer.classed('is-dragging', false)
      resizingSizer = null
    }
  }
}

function isNested (d, i) {
  const column = d.column

  if (!column.isChild) return false

  return d.locked === 'right'
    ? column.childIndex > 0
    : column.childIndex < column.childTotal - 1
}

function leftAndNested (d) {
  return d.left + (isNested(d) ? '✓' : '✗')
}
