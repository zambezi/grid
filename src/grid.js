import { calculateColumnLayout } from './calculate-column-layout'
import { compose } from 'underscore'
import { createBody } from './body'
import { createColumnDrag } from './column-drag'
import { createColumnSizers } from './column-sizers'
import { createEnsureColumns } from './ensure-columns'
import { createExportServerSideFilterAndSort } from './export-server-side-filter-and-sort'
import { createGroupRows } from './group-rows'
import { createHeaders } from './headers'
import { createLayOutBodyAndOverlays } from './lay-out-body-and-overlays'
import { createMarkRowIndices } from './mark-row-indices'
import { createMeasureGridArea } from './measure-grid-area'
import { createMouseWheel } from './mouse-wheel'
import { createProcessRowData } from './process-row-data'
import { createProcessSizeAndClipping } from './process-size-and-clipping'
import { createRunExternalComponents } from './run-external-components'
import { createScrollers } from './scrollers'
import { createSetupGridTemplate } from './setup-grid-template'
import { createShareDispatcher } from './share-dispatcher'
import { createSortRowHeaders } from './sort-row-headers'
import { createSortRows } from './sort-rows'
import { createUnpackNestedRows } from './unpack-nested-rows'
import { dispatch as createDispatch } from 'd3-dispatch'
import { ensureData } from './ensure-data'
import { ensureId } from './ensure-id'
import { rebind, redispatch, call, skipWhenHidden, each, redraw, createResize, createAutoDirty, throttle, throttleToAnimationFrame } from '@zambezi/d3-utils'

import './grid.css'

export function createGrid () {
  const setupTemplate = createSetupGridTemplate()
  const ensureColumns = createEnsureColumns()
  const processRowData = createProcessRowData()
  const processSizeAndClipping = createProcessSizeAndClipping()
  const columnDrag = createColumnDrag()
  const resize = createResize()
  const unpackNestedRows = createUnpackNestedRows()
  const columnSizers = createColumnSizers()
  const coreEvents = createDispatch('draw', 'settings-changed')
  const groupRows = createGroupRows()
  const body = createBody()
  const runExternalComponents = createRunExternalComponents()
  const runExternalComponentsPre = createRunExternalComponents()
  const sortRowHeaders = createSortRowHeaders()
  const serverSideFilterAndSort = createExportServerSideFilterAndSort()
  const shareDispatcher = createShareDispatcher()
  const autodirty = createAutoDirty()
  const redispatcher = redispatch()
            .from(coreEvents, 'draw', 'settings-changed')
            .from(sortRowHeaders, 'sort-changed')
            .from(
              body
            , 'visible-lines-change'
            , 'cell-enter'
            , 'cell-exit'
            , 'cell-update'
            , 'row-changed'
            , 'row-enter'
            , 'row-exit'
            , 'row-update'
            )
            .create()

  const api = rebind()
            .from(body, 'rowChangedKey', 'rowKey')
            .from(columnDrag, 'dragColumnsByDefault', 'acceptColumnDrop')
            .from(columnSizers, 'resizeColumnsByDefault')
            .from(ensureColumns, 'columns')
            .from(groupRows, 'groupings')
            .from(processRowData, 'filters', 'filtersUse', 'skipRowLocking')
            .from(processSizeAndClipping, 'scroll')
            .from(redispatcher, 'on')
            .from(resize, 'wait:resizeWait')
            .from(runExternalComponents, 'use', 'components:externalComponents')
            .from(runExternalComponentsPre, 'use:usePre', 'components:externalComponentsPre')
            .from(serverSideFilterAndSort, 'serverSideFilterAndSort')
            .from(setupTemplate, 'template')
            .from(sortRowHeaders, 'sortableByDefault')
            .from(unpackNestedRows, 'showRowWhenCollapsed')

  const grid = compose(
          call(d => window.timeGrid && console.timeEnd('grid')),
          call(() => coreEvents.call('draw')),
          call(s => s.on('settings-changed', () => coreEvents.call('settings-changed'))),
          call(runExternalComponents),
          call(createScrollers()),
          call(sortRowHeaders),
          call(columnSizers),
          call(columnDrag),
          call(createHeaders()),
          call(body),
          each(createLayOutBodyAndOverlays()),
          call(createMouseWheel()),
          call(processSizeAndClipping),
          call(createMeasureGridArea()),
          call(createMarkRowIndices()),
          call(unpackNestedRows),
          call(createSortRows()),
          call(processRowData),
          call(runExternalComponentsPre),
          call(resize),
          call(setupTemplate),
          each(calculateColumnLayout),
          call(groupRows),
          call(ensureColumns),
          call(serverSideFilterAndSort),
          each(shareDispatcher.dispatcher(redispatcher)),
          each(ensureData),
          each(ensureId),
          call(d => window.timeGrid && console.time('grid'))
        )

  return api(autodirty(redraw(throttle(throttleToAnimationFrame(skipWhenHidden(grid)), 10))))
}
