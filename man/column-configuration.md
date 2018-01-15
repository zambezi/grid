### Column configuration

#### Column by attribute

By default, the grid will generate columns for each of the properties of the row elements.  It will determine which properties to use by checking the first element in the data generating one column for each of its keys.  You can configure which columns you want your grid to display by providing a column configuration array.
Note that the `columns` getter/setter returns the same `grid` object.
This allows "fluid" configurations expressions of the style `grid.configA(a).configB(b) // ... etc`.

```javascript
const columns = [ { key: "a" } , { key: "b"  } ]
    , grid = createGrid().columns(columns)

d3.select("#grid-target").datum(data).call(grid)
```

The most basic specification for a column is its a `key` property.
That's the key on each of the objects for the property that must be displayed on each column.

Keys can also be specified for nested values.
If you have a row with a nested structures such as `[ { id: "A1", b: { c: 1, d: { e: 1, f: 2}} }, ... ]`, you can specify columns with keys like:

```javascript
const columns = [ { key: "id" }, { key: "b.c" }, { key: "b.d.f" }  ]
```

#### Column header labels

  You can specify a `label` string for the label on the column header.
  If the `label` field is not provided, the `key` will be used instead.

```javascript
const columns = [
  {
    key: "bid"
  , label: "Bid Price"
  }
  ...
```

#### Column header hints

  You can specify a `hint` string for the label on the column header.
  If the `hint` field is not provided, the `label` will be used instead, if `label` is not provided, `key` will be used
  If `hint` is specified as empty string then hint will not be displayed

```javascript
const columns = [
  {
    key: "bid"
  , label: "Bid Price"
  , hint: "Bid Price long descripion"
  },
  {
    key: "bidName"
  , label: "Bid Name"
  , hint: ""
  }
  ...
```


#### Hidden columns

Columns can be hidden or shown using the default column selector.
It is possible to configure the visibility of columns programmaticaly by setting a `hidden` property on them:

```
const columns = [
  {
    key: "bid"
  , label: "Bid Price"
  , hidden: true
  }
  ...
```

#### Column formatters

A formatter function can be specified per column.
This function will receive the value of the row's property and should return a string representation of it.

```javascript
const columns = [
  {
    key: "bid"
  , label: "Bid Price"
  , format: priceFormatter
  }
, {
    key: "date"
  , label: "Purchase Date"
  , format: purchaseDateFormmater
  }
]

function priceFormatter(d) {
  return d.toFixed(3)
}

function purchaseDateFormmater(d) {
  return [
    d.getFullYear()
  , d.getMonth() + 1
  , d.getDate()
  ].join("/")
}
```

Note that if you have specified the `key` for the column, the formatter function will receive the attribute of the object for that key.
If you have not specified the `key` on the column specification the formatter function will receive the row object itself.

For example, these two column specifications will be displayed in the same way:

```javascript
[
  {
    key: "a"
  , format: d3.format(".3f")
  }

, {
    format: function aFormatter(d) { return d3.format(".3f")(d.a) }
  }
]
```

For formatter functions we recommend the use of the available D3 functions:

```javascript
var columns = [ {
    key: "bid"
  , label: "Bid Price"
  , format: d3.format(".3f")
  }
, {
    key: "date"
  , label: "Purchase Date"
  , format: d3.timeFormat("%Y/%m/%d")
  }
]
```

* <https://github.com/d3/d3-format>
* <https://github.com/d3/d3-time-format>

If no formatter function is specified, the grid will use call `String(value)`.

#### Derived columns

You might want to represent a value derived from more than one element of the row object.
For example, you might want to programmatically calculate a spread based on bid and price values.

For this case you can specify a column _without_ a key value.
The formatter function will then receive the full row object which form which you can generate the appropriate value.

```
const columns = [
  ...
, {
    label: "Spread"
  , format: spreadFormatter
  }
]

function spreadFormatter(d) {
  return d3.format(".3f")(d.ask - d.bid)
}
```

#### Custom column classes

Should you wish to add bespoke styling to all cells in a particular column you can specify extra classes to be added to each cell.

```javascript
const columns = [
  ...
, {
  , key: "id"
  , className: "my-custom-class-1 my-custom-class-2"
  }
]
```

NOTE: this will be applied to cells only when they are created -- and will not dynamically change after cell creation.

#### Column width

The grid will generate default column width by dividing the available space between the number of columns.
You can specify the width of particular columns by  setting a width property on its declaration.
The value is specified in pixels.

```javascript
const columns = [
  ...
, {
  , key: "id"
  , width: 50
  }
]
```

The columns with no specified widths will still get an equal share of the remaining width.

If the column widths exceed the available width for the grid then horizontal scrolls will appear.

#### Nested Columns

Columns can be nested.
You can create a `children` property on a column specification and add columns to it to declare column groups:

```javascript

const columns = [
, { key: "id"}
  {
    label: "Price"
  , children: [
      { key: "bid", label: "Bid", format: d3.format(".3f") }
    , { key: "ask", label: "Ask", format: d3.format(".3f") }
    ]
  }
]

```

The width from nested columns is calculated by adding the width of the children columns (these width can be created by default by the grid or specified trough the `width` property).
Width specifications on parent columns will be ignored.

Currently, the component only supports one level of nesting.

#### Locked Columns

Columns can be locked left or right.
You can specify `"left"` or `"right"` on the `locked` property of a column declaration.
Multiple columns can be locked left or right.

```javascript
const columns = [
, { key: "id", locked: "left"}
, { key: "a" }
, { key: "b" }
, { key: "size", locked: "right"}
, { key: "total", locked: "right"}
}
```

Grouped columns can also be locked.

#### Resizable Columns

Columns can be resized by dragging the sizers between them.
Columns are, by default, resizable.
You can configure this behaviour by changing the `resizeColumnsByDefault` argument of the grid component:

```javascript
const grid = createGrid().resizeColumnsByDefault(false)
```

You can also override on a per-column basis the default behaviour for the grid.

```javascript
grid.resizeColumnsByDefault(false)
    .columns(
      [
        {
          key: "date"
        }
      , {
          key: "id"
        , resizable: true
        }
      ]
    )
```

#### Dragging columns

Columns can be rearranged by dragging their headers.
Columns are, by default, draggable.
You can configure this behaviour by changing the `dragColumnsByDefault` argument of the grid component:

```javascript
const grid = createGrid().dragColumnsByDefault(false)
```

You can also override on a per-column basis the default behaviour.

```javascript
grid.columns(
      [
        {
          key: "date"
        }
      , {
          key: "id"
        , draggable: false
        }
      ]
    )
```

Sometimes it's necessary to be able to prevent columns to be dropped at specific locations.
For example, you might not want to allow columns to be dropped to the left of some column or inside a column group.

You can determine when a column drop can be accepted by providing a function to the `acceptColumnDrop` grid argument:

```javascript
grid.columns(columns)
    .acceptColumnDrop(acceptColumnDrop)

function acceptColumnDrop(col, left, right, newParent, locked) {
  return right.id !== "x" // Prevent columns to be dropped to the left of the "x" column.
}
```

The arguments passed to this function are:

1. The column being dragged.
2. The column to the left of drop position.
3. The column to the right of drop position.
4. The new column parent, if the column is dropped under a column group.
5. The new `locked` configuration of the column,
    This can be either the strings `"left"` or `"right"`, or `undefined` if the column is not going to be locked.

This function must return `true` if the column can be dropped in the described position.

#### Column sorting

Columns are by default sortable.
This means that you can toggle the sorting of the data by clicking on the column header.

You can turn off sorting for particular columns by adding the attribute `sortable = false` to the specific column configuration object.

```javascript
grid.columns(
      [
        {
          key: "date"
        }
      , {
          key: "id"
        , sortable: false
        }
      ]
    )
```

You can configure the default sorting behaviour by using the `sortableByDefault` property on the grid.

```javascript
grid.sortableByDefault(false)
```

By default the grid will sort based on the rendered text of the value for the column,
You can specify a custom sort function for the column if needed.

```javascript
grid.columns(
      [
        {
          key: "date"
        , sort: customDateSortFunction
        }
      , {
          key: "id"
        }
      ]
    )
```

The function is a typical [Array sort compare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) function.
It will be assumed to be a _sort ascending_ function.  You don't need to specify a _sort descending_; the same function will be used but its results will be flipped.

The sort function will receive the property value of the object if a key was specified, or the complete object otherwise.
See above 'Column by attribute'.

If you want a column to be sorted by default, you can specify it on the column configuration object by setting either `sortAscending: true` or `sortDescending: true`.

```javascript
grid.columns(
      [
        {
          key: "date"
        , sortDescending: true
        }
      , {
          key: "id"
        }
      ]
    )
```

#### Column virtualization

To be able to cope with large amount of columns the grid, by default, only renders cells for the visible columns.
As you scroll horizontally, cells that come into the viewport are created and cells that move outside the viewport are destroyed.

In most cases, this improves the performance of the grid by reducing the amount and processing of DOM elements on the browser.

#### Per column cell template

It is possible to define a cell template for specific columns by providing its HTML snipped on the `template` property of the column definition.

```javascript
grid.columns(
      [
        {
          key: 'date'
        }
      , {
        , key: 'template'
        , template: '<span>SOME TEMPLATE</span>'
        }
      ]
    )
```

If you provide a template it's contents won't get overwritten by the formatted text.
You can provide a per-column component (see below) to update the contents of the created cell.
Alternatively, you can provide a nested element with the class `formatted-text` in your template.
The default render will write the formatted text to it.

```javascript
grid.columns(
      [
        {
          key: 'date'
        }
      , {
        , key: 'info'
        , format: infoFormatter
        , template: '<span><i class='icon-light-small-info'></i><span class='formatted-text'></span></span>'
        }
      ]
    )
```

NOTE: Currently, the grid has a fixed row height.  Templates which would change the height of the row are not yet supported.
