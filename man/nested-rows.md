## Nested rows

The grid component supports nested rows.
To nest rows, add them them as an array to the `children` property of the parent row.

```javascript
const data = [
        { id: '1', b: 2 }
      , { id: '2', b: 4 }
      , {
          id: '3'
        , b: 6
        , children: [
            { id: '3a', b: 106 }
          , { id: '3b', b: 206 }
        }
      , { id: '4', b: 8 }
      ]

d3.select('.grid').datum(data).call(grid)
```

### Nested row expanders

In order to display the row hierarchy on a particular column you need to use the _nested row expanders_ column component.
Simply import it and add it to the `components` list for the column you want it to operate on.

```javascript
...
import { createNestedRowExpanders, createGrid } from '@zambezi/grid'

const grid = createGrid()
          .columns(
            [
              ...
            , {
                key: 'client-name'
              , components: [ createNestedRowExpanders() ]
              , width: 170
              }
            ]
          )
```

The _nested row expanders_ component will also render label, and will use the standard column formatter and key properties to do so. 
If you want to use the expanders without a label, you can configure a formatter to return an empty string for that column.

If you want certain rows to be expanded from the outset, set on them an `expanded` property set to true.

The grid supports arbitrarily nested rows.
Nested columns can have their own `children` columns with deeper nested rows.

NOTE: cells that use the nested rows expanded components don't support truncation.

### Simple row expanders

If you don't need tree-like expanders that are deeply nested, you can use `simpleNestedRowExpanders` to render a basic expand/collapse control.
Their usage is similar to the nested row expanders:

```javascript
...
import { createNestedRowExpanders, createGrid } from '@zambezi/grid'

const grid = createGrid()
          .columns(
            [
              ...
            , {
                key: 'client-name'
              , components: [ createSimpleNestedRowExpanders() ]
              , width: 40
              }
            ]
          )
```

(See the simple-nested-row example in the examples folder for a working sample)

## Show rows when collapsed

The grid component supports optionally showing nested row base on a predicate, at the first-level depth.
This means that conditionally always-shown rows (ie rows that return `true` from the `showRowWhenCollapsed` predicate) will be shown even if the parent is not expanded.
Although, if the parent is in turn a child of a collapsed parent, they will not be shown.

`showRowWhenCollapsed` is `null` by default, so all rows will be hidden when the parent row is collapsed. It is possible to specify it like this:

```javascript
...
import { createNestedRowExpanders, createGrid } from '@zambezi/grid'

const grid = createGrid()
          .columns(
            [
              ...
            , {
                key: 'client-name'
              , components: [ createNestedRowExpanders() ]
              , width: 170
              }
            ]
          )
          .showRowWhenCollapsed(d => d.pinned) // If row has a truthy `pinned` property, show it anyways
```

You can see an example of this in `examples\pinned-nested-rows.html`