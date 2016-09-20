## Grid components

Grids compose a series of subcomponents.
These subcomponents take care of different elements of drawing the grid.
One draws the body, one the headers, the other handles column resize, for example.

You can extend or modify the grid by providing your own subcomponents to it using the `use()` method:

```javascript
grid = createGrid()
    .use(customComponent)
    .use(anotherComponent)

target.select('.custom-component-example')
    .datum(data)
    .call(grid)
```

The subcomponent is a standard [D3 component](http://bost.ocks.org/mike/chart/) which will be automatically run on the main grid DOM for which a object with different layout and row information will be bound.

Read and run, on the `examples` folder, the `run-external-components.html` file to see a couple of very simple components declared.

It might be useful to run components before the rows have been processed and cell data has been generated.
In that case, use `usePre` instead of `use` to register your component.

NOTE: when designing grid components, be aware that these components will be run every time the grid itself is drawn -- which might be more times than what you'd expect.  For example, the grid will run each on component un scroll, on sort, on resize, etc.
Your components must be designed so that they can be called many times and not run expensive or repetitive computations unnecessarily.
Utility functions like [d3-utils' `selectionChanged`](https://github.com/zambezi/d3-utils/blob/master/man/selection-changed.md) should be used to create components with good performance under repetitive calls.
