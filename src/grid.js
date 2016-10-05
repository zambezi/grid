import { calculateColumnLayout } from './calculate-column-layout'
import { compose, wrap } from 'underscore'
import { createBody } from './body'
import { createColumnDrag } from './column-drag'
import { createColumnSizers } from './column-sizers'
import { createEnsureColumns } from './ensure-columns'
import { createExportServerSideFilterAndSort } from './export-server-side-filter-and-sort'
import { createGroupRows } from './group-rows'
import { createHeaders } from './headers'
import { createLayOutBodyAndOverlays } from './lay-out-body-and-overlays'
import { createMarkRowIndices } from './mark-row-indices'
import { createMeasureGridArea }  from './measure-grid-area'
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

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , ensureColumns = createEnsureColumns()
      , processRowData = createProcessRowData()
      , processSizeAndClipping = createProcessSizeAndClipping()
      , columnDrag = createColumnDrag()
      , resize = createResize()
      , columnSizers = createColumnSizers()
      , dispatchDraw = createDispatch('draw')
      , groupRows = createGroupRows()
      , body = createBody()
      , runExternalComponents = createRunExternalComponents()
      , runExternalComponentsPre = createRunExternalComponents()
      , sortRowHeaders = createSortRowHeaders()
      , serverSideFilterAndSort = createExportServerSideFilterAndSort()
      , shareDispatcher = createShareDispatcher()
      , autodirty = createAutoDirty()
      , redispatcher = redispatch()
            .from(dispatchDraw, 'draw')
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

      , api = rebind()
            .from(columnDrag, 'dragColumnsByDefault', 'acceptColumnDrop')
            .from(columnSizers, 'resizeColumnsByDefault')
            .from(ensureColumns, 'columns')
            .from(groupRows, 'groupings')
            .from(processRowData, 'filters', 'filtersUse', 'skipRowLocking')
            .from(processSizeAndClipping, 'scroll')
            .from(redispatcher, 'on')
            .from(resize, 'wait:resizeWait')
            .from(runExternalComponents, 'use')
            .from(runExternalComponentsPre, 'use:usePre')
            .from(serverSideFilterAndSort, 'serverSideFilterAndSort')
            .from(setupTemplate, 'template')
            .from(sortRowHeaders, 'sortableByDefault')

      , grid = compose(
          call(() => dispatchDraw.call('draw'))
        , call(runExternalComponents)
        , call(createScrollers())
        , call(sortRowHeaders)
        , call(columnSizers)
        , call(columnDrag)
        , call(createHeaders())
        , call(body)
        , each(createLayOutBodyAndOverlays())
        , call(createMouseWheel())
        , call(processSizeAndClipping)
        , call(createMeasureGridArea())
        , call(createMarkRowIndices())
        , call(createUnpackNestedRows())
        , call(createSortRows())
        , call(processRowData)
        , call(runExternalComponentsPre)
        , call(resize)
        , call(setupTemplate)
        , each(calculateColumnLayout)
        , call(groupRows)
        , call(ensureColumns)
        , call(serverSideFilterAndSort)
        , each(shareDispatcher.dispatcher(redispatcher))
        , each(ensureData)
        , each(ensureId)
        )

  return api(autodirty(redraw(throttle(throttleToAnimationFrame(skipWhenHidden(grid)), 10))))
}
