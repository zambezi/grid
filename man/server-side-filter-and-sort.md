## Server side filter and sorting


When a data set is too large, it might not make sense to send it all at once to the client.
You might want to populate a grid little by little, requesting data as needed.

The grid supports sparse datasets it can run in _server side filter and sort_ mode by turning it on with `serverSideFilterAndSort` getter/setter.
When this is turned on, no attempt to filter or sorting will be done by the grid.
You can use the grid events to request the relevant data from the server:

```javascript
grid.serverSideFilterAndSort(true)
    .on('sort-changed', requestSortedData)
    .on('visible-lines-change', requestPageForVisibleLines)
```

Where

* `sort-changed` will pass your handler the column related to the header's sort gesture
* `visible-lines-change` will pass your handler information about the currently visible rows in the grid.

You can use your events to request additional data rows from the server.
Once you get them, you can merge or replace them and redraw the grid.

There's an example of this in the provided `examples` folder.
