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
