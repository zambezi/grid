## Quick Start

### Running the grid

To run the grid all you need is an array of objects.
Each element will be a row and its properties will be the columns.

The grid itself is a component in the D3 sense: a function that is run on a selection.
You don't feed _it_ the data, you _bind_ the data to your DOM selection and then you run the component function on it:
The component will automatically get the data that was bound to it and will generate the necessary DOM elements to represent it..

```javascript
const data = [              // The grid works normal arrays of rows
                            // By default, each property of the row will become a column.

      { a: 1, b: 11, c: 111 }
    , { a: 2, b: 22, c: 222 }
    , { a: 3, b: 33, c: 333 }
    , { a: 4, b: 44, c: 444 }
    , { a: 5, b: 55, c: 555 }
    ]
  , grid = createGrid()     // Create an instance of the grid function

d3.select("#grid-taget")    // Select the node on which you want the grid to be run
    .datum(data)            // Bind the data to that node.
    .call(grid)             // Call the grid function on the node.
```

### Redrawing the grid

To redraw the grid just call it again on the target.

```javascript
const grid = createGrid()
    , target = d3.select(node)


target.datum(data).call(grid)


// .... later,
// if the data is still the same,

target.call(grid)

// .... later,
// if the data has changed

target.datum(newData).call(grid)
```

The grid will try its best to re-render smartly.

### Sizing the grid

The grid needs and explicit height, it does not "generate" height on its own, but adjusts the viewport to the size that you give it.
If you forget to explicitly size it, it will display an  `Illegal Size` error in the console.

Most of the time, something as simple as `target.style('height', '500px').datum(rows).call(grid)` will do.

The grid will listen to `window.resize` events so it will adjust whenever the viewport changes.
If, for some reason, you need to resize the grid's area, you can invalidate the grid size caches by dispatching `size-dirty` on the grid DOM node.

### Running the examples

Examples for the different grid features are included in the repo.
To run them, simply 

1. clone the repo from github.
2. `cd` into the checkout folder.
2. `npm install`
3. open the `examples` folder on your file browser.
4. double-click on the html example file that you want to run -- the example should open up on your favourite browser and just run.
