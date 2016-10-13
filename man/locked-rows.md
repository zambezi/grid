
### Locked Rows

Rows can be locked to the top or bottom.
To lock a row set on it a `locked` property to either the `"top"` or `"bottom"` strings.

````javascript
const data = [
  { id: "1", b: 2 }
, { id: "2", b: 4 }
, { id: "3", b: 6, locked: "bottom" }
, { id: "4", b: 8 }
]

d3.select(".grid").datum(data).call(grid)
```
