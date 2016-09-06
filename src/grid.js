import { calculateColumnLayout } from './calculate-column-layout'
import { compose, wrap } from 'underscore'
import { createBody } from './body'
import { createColumnDrag } from './column-drag'
import { createColumnSizers } from './column-sizers'
import { createEnsureColumns } from './ensure-columns'
import { createHeaders } from './headers'
import { createLayOutBodyAndOverlays } from './lay-out-body-and-overlays'
import { createMarkRowIndices } from './mark-row-indices'
import { createMeasureGridArea }  from './measure-grid-area'
import { createProcessRowData } from './process-row-data'
import { createProcessSizeAndClipping } from './process-size-and-clipping'
import { createScrollers } from './scrollers'
import { createSetupGridTemplate } from './setup-grid-template'
import { createSortRowHeaders } from './sort-row-headers'
import { createSortRows } from './sort-rows'
import { dispatch as createDispatch } from 'd3-dispatch'
import { ensureData } from './ensure-data'
import { ensureId } from './ensure-id'
import { rebind, redispatch, call, each, redraw, createResize, createAutoDirty,
          throttle } from '@zambezi/d3-utils'

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
      , body = createBody()
      , sortRowHeaders = createSortRowHeaders()
      , autodirty = createAutoDirty()
      , grid = compose(
          call(() => dispatchDraw.call('draw'))
        , call(createScrollers())
        , call(sortRowHeaders)
        , call(columnSizers)
        , call(columnDrag)
        , call(createHeaders())
        , call(body)
        , each(createLayOutBodyAndOverlays())
        , call(processSizeAndClipping)
        , call(createMeasureGridArea())
        , call(createMarkRowIndices())
        , call(createSortRows())
        , call(processRowData)
        , call(resize)
        , call(setupTemplate)
        , each(calculateColumnLayout)
        , call(ensureColumns)
        , each(ensureData)
        , each(ensureId)
        )

      , redispatcher = redispatch()
            .from(dispatchDraw, 'draw')
            .from(body, 'visible-lines-change')
            .create()

      , api = rebind()
            .from(columnDrag, 'dragColumnsByDefault', 'acceptColumnDrop')
            .from(columnSizers, 'resizeColumnsByDefault')
            .from(redispatcher, 'on')
            .from(ensureColumns, 'columns')
            .from(processRowData, 'filters', 'filtersUse', 'skipRowLocking')
            .from(processSizeAndClipping, 'scroll')
            .from(resize, 'wait:resizeWait')
            .from(setupTemplate, 'template')
            .from(sortRowHeaders, 'sortableByDefault')

  return api(autodirty(redraw(throttle(grid, 10))))
}
