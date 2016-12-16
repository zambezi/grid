## Core grid events

Besides the [row and cell lifecycle events](./row-and-cell-events.md) nd the [events related to server side filter and sorting](server-side-filter-and-sort) the grid dispatches two more core events that might be useful for synchronizing to it.

* `redraw` will be dispatched every time the grid has drawn -- either by user interaction or by internal request.
* `settings-changed` will be dispatched whenever the _settings_ of the grid have changed -- currently, these are: 
  * a column has been dragged
  * a column has been resized
  * the sort on a column has changed.
