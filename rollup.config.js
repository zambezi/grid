import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'

export default {
  entry: 'src/index.js',
  dest: 'dist/grid.js',
  format: 'umd',
  moduleName: 'grid',
  external: [ 'd3-selection', '@zambezi/fun', 'underscore', '@zambezi/d3-utils' ],
  sourceMap: true,
  plugins: [ babel(babelrc()) ],
  globals: {
    '@zambezi/d3-utils': 'd3Utils',
    '@zambezi/fun': 'fun',
    'underscore': '_',
    'd3-selection': 'd3'
  }
}
