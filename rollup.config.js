import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import postcss from 'rollup-plugin-postcss'

export default {
  entry: 'src/index.js'
, dest: 'dist/grid.js'
, format: 'umd'
, moduleName: 'grid'
, external: [
    '@zambezi/d3-utils'
  , '@zambezi/fun'
  , 'd3-format'
  , 'd3-selection'
  , 'd3-timer'
  , 'd3-ease'
  , 'd3-transition'
  , 'underscore'
  ]
, sourceMap: true
, plugins: [
    postcss(
      {
        plugins: [ ]
      , extensions: ['.css', '.sss']
      }
    )
  , babel(babelrc())
  ]
, globals: {
    '@zambezi/d3-utils': 'd3Utils'
  , '@zambezi/fun': 'fun'
  , 'd3-format': 'd3'
  , 'd3-selection': 'd3'
  , 'd3-timer': 'd3'
  , 'd3-ease': 'd3'
  , 'd3-transition': 'd3'
  , 'underscore': '_'
  }
}
