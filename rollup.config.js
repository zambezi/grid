import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'

export default {
  entry: 'src/index.js',
  dest: 'dist/grid.js',
  format: 'umd',
  moduleName: 'grid',
  external: [ ],
  sourceMap: true,
  plugins: [ babel(babelrc()) ],
  globals: {
    '@zambezi/d3-utils': 'd3Utils',
    'underscore': '_',
    'd3-selection': 'd3'
  }
}
