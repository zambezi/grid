#### Grid performance and row constancy

By default, the grid matches the row DOM elements to the elements in the data array by position:
the first element in the list is rendered on the first DOM element on the page, the second to the second, etc.

For example,
if you add an element in the middle of the list and redraw the grid, all the elements from that position on will have a different element to render so all the text in the cells, etc. must change not only for that element but for all the elements after it.

    Before:             After:                      DOM changes from

    DOM-A → item-0      DOM-A → item-0
    DOM-B → item-1      DOM-B → item-1
    DOM-C → item-2      DOM-C → item-1B (new item). item-2 to new item-1B
    DOM-D → item-3      DOM-D → item-2  ........... item-3 to item-2
    DOM-E → item-4      DOM-E → item-3  ........... item-4 to item-3
                        DOM-F → item-4  ........... item-4 drawn on a completely new node.

But one can configure the grid to recognize the elements that it had before so that it will reuse the same DOM elements, potentially reducing the amount of changes to the DOM.
To do this, you can configure the `rowKey` property on the grid.

    var grid = createGrid().rowKey(key)

    function key(d) {
      return d.id
    }

The function passed to `rowKey` should return a unique string that identifies the row.
The grid will use that function to determine which, if any, of the currently available row DOM elements already renders that row and will use that again for the same row.
So, if we use `rowKey` on our example:

    Before:             After:

    DOM-A → item-0      DOM-A → item-0
    DOM-B → item-1      DOM-B → item-1
    DOM-C → item-2      DOM-F → item-1B (new item drawn on a completely new node.)
    DOM-D → item-3      DOM-C → item-2
    DOM-E → item-4      DOM-D → item-3
                        DOM-E → item-4

This configuration allows [object constancy](http://bost.ocks.org/mike/constancy/) for rows.

Note that the row updates will still be applied to the DOM nodes even if they were the same nodes as the last time, as the data in the row fields might have changed,

If you want to skip re-renders for row items you know have not changed, you can configure the grid to understand these changes.
You can use the `rowChangedKey` property on the grid.
(This is normally used in conjunction with `rowKey` to make sure the same rows will be drawn on the same DOM nodes)

    var grid = createGrid()
          .rowKey(_.property('id'))
          .rowChangedKey(rowChangedKey)

    function rowChangedKey(d, i) {
      return d.id + '|' + d.bid + '|' d.ask
    }

This function should return a string which encodes what can change from a row.
In our example, we make a string which pairs the prices with the id, into strings such as `A234|4.234|3.234`
Whenever the grid redraws it will call this function and check if the returned value is the same as the previous result.
If it is, it will skip the drawing of that row altogether.

Note that the grid is (by default) virtualized, rows and cells are constantly being destroyed to keep the number low.
If your row has gone out of the visible area, the next time it appears it will need to be created and process again.

There is no silver bullet for performance, but you can do some tinkering with this settings to achieve the best performance for your particular data set.
Short data sets might not benefit from virtualization and might perform better without it if in combination with these `rowKey`  and `rowChangedKey` functions.

Also, sometimes it might be cheaper to redraw a new data item onto an old row with a different item than to replace the row altogether.
As with anything performance-related, results can be counter-intuitive.
Always use profiler and benchmark your options for determining the optimal configuration for your grid.
