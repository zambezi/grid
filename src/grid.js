import { calculateColumnLayout } from './calculate-column-layout'
import { compose, wrap } from 'underscore'
import { createBody } from './body'
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
import { ensureData } from './ensure-data'
import { ensureId } from './ensure-id'
import { rebind, call, each, redraw, createResize, throttle } from '@zambezi/d3-utils'

import './grid.css'

export function createGrid() {

  const setupTemplate = createSetupGridTemplate()
      , ensureColumns = createEnsureColumns()
      , processRowData = createProcessRowData()
      , processSizeAndClipping = createProcessSizeAndClipping()
      , resize = createResize()
      , columnSizers = createColumnSizers()
      , body = createBody()
      , grid = compose(
          call(createScrollers())
        , call(columnSizers)
        , call(createHeaders())
        , call(body)
        , each(createLayOutBodyAndOverlays())
        , call(processSizeAndClipping)
        , call(createMeasureGridArea())
        , call(createMarkRowIndices())
        , call(processRowData)
        , call(resize)
        , call(setupTemplate)
        , each(calculateColumnLayout)
        , call(ensureColumns)
        , each(ensureData)
        , each(ensureId)
        , each(() => console.group('draw'))
        )
      , api = rebind()
            .from(columnSizers, 'resizeColumnsByDefault')
            .from(ensureColumns, 'columns')
            .from(processRowData, 'filters', 'filtersUse', 'skipRowLocking')
            .from(processSizeAndClipping, 'scroll')
            .from(resize, 'wait:resizeWait')
            .from(setupTemplate, 'template')

  return api(redraw(throttle(grid, 10)))
}
