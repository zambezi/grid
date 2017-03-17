import { columnDragTargetLayout as dragTargetLayout } from './column-drag-target-layout'
import { compose, isUndefined } from 'underscore'
import { createGridSheet } from './grid-sheet'
import { select, event, mouse } from 'd3-selection'
import { appendFromTemplate, selectionChanged, fromTarget } from '@zambezi/d3-utils'

import './column-drag.css'

const template = `<li class="zambezi-grid-column-drop-target">
        <div class="zambezi-grid-column-drop-indicator"></div>
        <div class="zambezi-grid-column-drop-indicator-overlay"></div>
      </li>`
const dropWidth = 20
const dropCenterTolerance = 3
const append = appendFromTemplate(template)
const left = pixels('left')

export function createColumnDrag () {
  const sheet = createGridSheet()
  const draggableChanged = selectionChanged()
  const dropCriteria = [ notDroppingNestedInNested, customCriteria ]

  let dragColumnsByDefault = true
  let columnDragged
  let acceptColumnDrop
  let previousParent
  let columnOriginList
  let targetParent
  let targetLocked
  let targetColumnLeft
  let targetColumnRight

  function columnDrag (s) {
    s.each(columnDragEach)
  }

  columnDrag.acceptColumnDrop = function (value) {
    if (!arguments.length) return acceptColumnDrop
    acceptColumnDrop = value
    return columnDrag
  }

  columnDrag.dragColumnsByDefault = function (value) {
    if (!arguments.length) return dragColumnsByDefault
    dragColumnsByDefault = value
    return columnDrag
  }

  return columnDrag

  function columnDragEach (d, i) {
    const bundle = d
    const root = select(this).call(setTransitionAnimationListeners)
    const componentId = root.attr('id')
    const list = root.select('.zambezi-grid-column-drop')
              .classed('zambezi-grid-overlay', true)
    const headers = root.select('.zambezi-grid-headers')

    headers.selectAll('.zambezi-grid-header')
            .on('dragstart.column-drag', onDragStart)
            .on('dragend.column-drag', onDragEnd)
          .select(draggableChanged.key(changed))
            .call(setDraggableProperties)

    headers.selectAll('.zambezi-grid-double-header')
            .on('dragstart.column-drag', onDragStart)
            .on('dragend.column-drag', onDragEnd)
          .select(draggableChanged)
            .call(setDraggableProperties)

    function onDragStart (d) {
      const dataTransfer = event.dataTransfer
      const source = select(this)

      columnDragged = d
      previousParent = columnDragged.parentColumn
      columnOriginList = previousParent ? previousParent.children
          : bundle.columns

      dataTransfer.setData('text/plain', i)

      setDragStyle()
      setTimeout(drawOverlay, 100)  // delayed to prevent blocking of the
                                    // mouse gesture

      event.stopPropagation()

      function setDragStyle () {
        source.classed('is-column-drag-source', true)
        dataTransfer.setDragImage(source.node(), 20, 20)
        window.requestAnimationFrame(clearDragStyle)
      }

      function clearDragStyle () {
        source.classed('is-column-drag-source', false)
      }
    }

    function drawOverlay () {
      const targets = list.classed('is-reordering', true)
              .selectAll('.zambezi-grid-column-drop-target')
              .data(dragTargetLayout(bundle), d => d.id)

      const targetsEnter = targets.enter().select(append)

      targets.merge(targetsEnter)
                .on('dragover.column-drag', onDragOver)
                .on('dragleave.column-drag', clearDropStyles)
                .on(
                  'drop.column-drag'
                , compose(
                      highlightMovedColumnCells
                    , () => list.dispatch('settings-changed', { bubbles: true })
                    , () => list.dispatch('redraw', { bubbles: true })
                    , dropColumnInDestination
                    , removeColumnFromOrigin
                    , cancelDropNavigation
                  )
                )
      targets.exit()
                .on('dragover.column-drag', null)
                .on('dragleave.column-drag', null)
                .on('drop.column-drag', null)
                .remove()

      targets.merge(targetsEnter).each(clearDropStyles).style('left', left)
    }

    function onDragEnd (d) {
      columnDragged = null
      list.classed('is-reordering', false)
    }

    function setDraggableProperties (s) {
      s.classed('is-draggable', draggable)
        .attr('draggable', draggable)
    }

    function draggable (d) {
      return (isUndefined(d.draggable) ? dragColumnsByDefault : d.draggable)
    }

    function changed (d, i) {
      return list.empty() ? '×'
        : (dragColumnsByDefault ? '✓' : '✗') + (draggable(d) ? '✓' : '✗')
    }

    function onDragOver (d, i) {
      const dropPositionX = mouse(this)[0]
      const dropSide = dropPositionX - (dropWidth / 2)
      const dropCenter = Math.abs(dropSide) < dropCenterTolerance
      const dropLeft = !dropCenter && dropSide < 0
      const dropRight = !dropCenter && dropSide > 0

      targetParent =
          dropLeft ? d.parentForLeft
        : dropRight ? d.parentForRight
        : d.parentForCenter

      targetLocked =
          dropLeft ? d.lockedForLeft
        : dropRight ? d.lockedForRight
        : d.lockedForCenter

      targetColumnRight = d.columnRight
      targetColumnLeft = d.columnLeft

      if (!dropCriteria.every(isOk)) return

      select(this)
          .classed('is-accepting', true)
          .classed('is-nested', !!targetParent)

      event.preventDefault()

      function isOk (d) {
        return d(columnDragged, targetColumnLeft, targetColumnRight, targetParent, targetLocked)
      }
    }

    function highlightMovedColumnCells () {
      if (!columnDragged) return

      const rules = (columnDragged.children || [columnDragged])
                .reduce(makeRule, {clear: {}, highlight: {}})

      applyRules(rules.clear)
      window.requestAnimationFrame(applyRules.bind(null, rules.highlight))

      function applyRules (rules) {
        Object.keys(rules).forEach(applyRule)
        function applyRule (key) {
          sheet(key, rules[key])
        }
      }

      function makeRule (rules, column) {
        rules.clear[cellSelector(column)] = {
          animationName: '',
          webkitAnimationName: ''
        }

        rules.highlight[cellSelector(column)] = {
          animationName: 'column-dropped',
          webkitAnimationName: 'column-dropped'
        }

        return rules
      }
    }

    function cellSelector (column) {
      return `#${componentId} .zambezi-grid-cell.c-${column.id}`
    }

    function removeColumnFromOrigin () {
      columnOriginList.splice(columnOriginList.indexOf(columnDragged), 1)
    }

    function cancelDropNavigation () {
      event.preventDefault()
    }

    function dropColumnInDestination () {
      const targetList = targetParent ? targetParent.children : bundle.columns
      const newIndex = findTargetDropIndex()

      targetList.splice(newIndex, 0, columnDragged)
      columnDragged.locked = targetLocked

      function findTargetDropIndex () {
        const columnLeftIndex = findTargetIndex(targetColumnLeft)
        const targetIndex = ~columnLeftIndex ? columnLeftIndex + 1 : findTargetIndex(targetColumnRight)

        return targetIndex
      }

      function findTargetIndex (c) {
        if (!c) return -1
        if (!targetParent) {
          return targetList.indexOf(c.isChild ? c.parentColumn : c)
        }
        return targetList.indexOf(c)
      }
    }

    function setTransitionAnimationListeners (s) {
      s.on('animationend.column-drag', fromTarget(clearHighlightTransition))
      ;['webkit', 'moz', 'MS', 'o'].forEach(addPrefixListener)
      function addPrefixListener (prefix) {
        s.on(
          prefix + 'AnimationEnd.column-drag.' + componentId
        , clearHighlightTransition
        )
      }
      function clearHighlightTransition (d, i) {
        if (this !== s.node()) return
        sheet(
          cellSelector(d.column)
          , { animationName: '', webkitAnimationName: '' }
        )
      }
    }
  }

  function customCriteria () {
    if (acceptColumnDrop) return acceptColumnDrop.apply(this, arguments)
    return true
  }
}

function notDroppingNestedInNested (column, left, right, newParent) {
  if (newParent && column.children) return false
  return true
}

function clearDropStyles (d, i) {
  select(this).classed('is-accepting', false)
    .classed('is-nested', false)
}

function pixels (field) {
  return function px (d, i) { return d[field] + 'px' }
}
