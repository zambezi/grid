## Row and cell life cycle events

  The grid dispatches several events which can be used to extend its functionality.

  Let's say you want to add a class to cells for which the value that it displays goes a certain threshold.
  You can subscribe to the `cell-update` event.
  This event will be dispatched for each cell as it is updated.
  From the handler you can get a hold of the DOM element of the cell as well as the data bound to it.
  You can use the data to determine if a class needs to be present on the node element and add it or remove it.

  The function you provide as handler will receive the associated data as its argument.
  The data element that you'll receive depends on the event that you're subscribed to; see the table below for more info.

A reference to the DOM element is available through the _this_ keyword.

```javascript
const grid = createGrid()
        .on("cell-update", onCellUpdate)
    , threshold = 300

select('.grid-target').datum(
  {
    { a: 100, b: 200 }
  , { a: 550, b: 100 }
  , { a: 350, b: 500 }
  }
).call(grid)

function onCellUpdate(d, i) {
  select(this)    // _this_ is the cell span
      .classed(   // set the class if the value goes above the threshold
        'is-over-threshold'
      , d.value > threshold
      )
}
```

What follows is a list of the life cycle events dispatched by the grid.

Event         | Dispatched                  | Object          | Notes
--------------|-----------------------------|-----------------|------
`row-enter`   | When a row is created       | Row Object(1)   | When virtualization is on, this will also be dispatched as rows are created when scrolling.
`row-update`  | Every time the row updates  | Row Object      | This is also called when the row is created.
`row-changed` | When the row changes        | Row Object      | If `rowChangedKey` is undefined, it will be dispatched the same as `row-update`. See performance section below.
`row-exit`    | When a row is removed       | Row Object      | When virtualization is on, this will also be dispatched as rows are destroyed when scrolling.
`cell-enter`  | When a cell is created      | Cell Object(2)  | When virtualization is on, this will also be dispatched as cells are created when scrolling.
`cell-update` | Every time the cell updates | Cell Object     | This is also called when the cell is created.
`cell-exit`   | When a cell is destroyed    | Cell Object     | When virtualization is on, this will also be dispatched as cells are destroyed when scrolling.

(1) _Row Object_ is an array that holds the cell data for all the cells in a row
The Row Object also provides references to the original row item in the list, to an array of the column specs for the cell block (cells in locked columns or blocks are in different cell blocks), and to the complete list of rows.

(2) _Cell Object_ is an object which holds has reference to the row element, the column configuration object for that particular cell, as well as the column id and the property value associated with the cell.
