## Grouped rows

Rows can be nested automatically by providing `grouping` configurations to the grid.
For example, if you want your rows to be grouped by 'category' and then by 'company', you can configure your grid with groupings like:

```javascript
grid.groupings(
  [
    {
      key: _.property('category')
    , rollup: categoryRollup
    , columnId: 'category'
    }

  , {
      key: _.property('company')
    , rollup: companyRollup
    , columnId: 'company'
    }
  ]
)

// ...

function categoryRollup(row, grouping) {
  var children = row.children
    , firstRow = children[0]
  row.category = row.children[0].category
  row.value =  children.map(_.property('value')).reduce(sum)
  return row
}

function companyRollup(row, grouping) {
  var children = row.children
    , firstRow = children[0]
  row.company = firstRow.company
  row.value =  children.map(_.property('value')).reduce(sum)
  return row
}
```

Where the grouping `key` is a function that produces a string by which the nested groups will be nested and the `rollup` is a function that will receive the generated grouping summary row so that you can populate its fields for display.
If you define `columnId`s, the columns will be resorted so that they match the order of the groupings.
In our example, the columns with ids `category` and `company` will be the first columns on the grid.

Note that generated roll-up rows objects will have a `isRollup` property set to true which you can use on your formatters to ignore certain fields if they are to be displayed on a roll-up row or the other way around.
For example, if you wanted the company field to be only displayed on the roll-up rows, you could specify the column's formatter to use a formatter like 

```javascript
function companyFormat(row) {
  if (row.isRollup) return row.company
  return ''
}

// ...

grid.columns(
  [
  // ...
    , {
        id: 'company'
      , format: companyFormat
      , sort: compareWith(d3.ascending, _.property('company'))
      , label: 'Company'
      }
  // ...
  ]
)
```
