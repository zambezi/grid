## Per column components

By default, the grid will render a string that represents the row which will use the provided formatter and the value from the `key` field or, if `key` is not provided, from the whole row object.

It is possible, though, to create custom components which can update the cells in different ways.
You declare these components in the optional `components` list on a particular column specification.

```javascript
grid.columns(
      [
        {
          key: "date"
        }
      , {
          key: "info"
        , components: [
            component1
          , component2
          , component3
          ]
        }
      ]
    )
```

These _components_ are simple functions which will be called for each of the cells whenever the cells are updated.
This is similar to the row and cell life cycle events (please see below) but only apply to cells that belong to the specified column and will be called every time on _update_.
That is, when the cells are created and updated.

As with the cell life cycle events the component function will get passed a _Cell Object_ with the data associated with a particular cell and will have the DOM element associated with the cell available through the _this_ property.  See 'Row and cell life cycle events' below for more information on the _Cell Object_.

```javascript
const grid = createGrid()
        .columns(
          [
            { key: "id" }
          , {
              key: "price"
            , components: [
                highlightNegativePrices
              ]
            }
          ]
        )

function highlightNegativePrices(d, i) {
  d3.select(this)
      .classed("is-negative", d.value < 0)
      .text(d.value.toPrecision(3))
}
```

The `cell object` will have a property `value` which is extracted either from the provided key or the whole object itself.
The `cell object` also has a reference to the `column` associated with the cell.
This `column specification` will carry the user-specified format function
if it was defined.
So, if you want to calculate in your component what the text representation of that cell is you can do:

```javascript
const format = d.column.format || String
    , text = format(d.value)
```

... where `d` is the datum bound to the node---the argument that your component will get passed.

The grid, by default, uses the `update-text-if-changed` column component to render the cell value based on the column formatter.
If define your own `components` array, that default component won't be used.
Because components can be several, if you don't want to reimplement that functionality you can still _import_ that column component and add it to your stack of components.

```javascript
const grid = createGrid()
        .columns(
          [
            ...
          , {
              key: "price"
            , components: [
                component1
              , component2
              , updateTextIfChanged
              ]
            }
          ]
        )
```

*NOTE:*
See _Grid component events_ if your component needs to trigger or listen for size changes, data changes, or redraws.
