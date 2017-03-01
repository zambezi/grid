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

### Manipulation of the components stack

When you use `use` or `usePre`, you're just pushing components into an array of components.
If you need to manipulate that array wholesale, you can inspect, modify or reassign the whole component list by using the `externalComponents` or `externalComponentsPre` getter / setters on the grid.

```
grid.externalComponents() // => the current components

grid.externalComponents([componentA, componentB]) // => overriding the current components
```


#### Grid component events

The grid provides a mechanism for signaling when

* The grid needs to redraw.
* The data is dirty so the grid caches should be flushed.
* The size of the grid has changed so the components need to be resized and laid out.

Your component can subscribe to these events on the provided selection.

```javascript
function doSomethingWithTheGrid(s)  {
  s.each(doSomethingWithTheGridEach)
      .on('data-dirty.my-namespace', flushComponentCache)
      .on('size-dirty.my-namespace', flushSizeCaches)
}

function doSomethingWithTheGridEach(d) {
  // ... etc.
}
```

*NOTE:*
You don't need to listen for `redraw`.
The grid will just schedule a future redraw automatically that will also run you component.

If you want to trigger these events from your component, you can use the `dispatch` method on the D3 selection to dispatch these events through the DOM.  
Make sure you allow them to bubble if they are dispatched from nested DOM elements.

```javascript
function doSomethingWithTheGrid(s)  {
  s.each(doSomethingWithTheGridEach)
}

function doSomethingWithTheGridEach(d) {
  var dispatcher = d.dispatcher

  d3.select(this).select('.something-in-my-component').on('click.my-namespace', onClick)

  function onClick() {
    // ... do some stuff
    // only if you need to, dispatch 'data-dirty'
    // only if you need to, dispatch 'size-dirty'
    // schedule a full grid redraw,
    d3.select(this).dispatch('redraw', { bubbles: true })
  }
}
```
