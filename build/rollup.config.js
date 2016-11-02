import { readFileSync } from 'fs'
import { resolve, join } from 'path'
import uglify from 'rollup-plugin-uglify'
import alias from 'rollup-plugin-alias'
import aliaCfg from './alias'

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
const banner = readFileSync('src/banner.js', 'utf-8')
                .replace('${moduleName}', pkg.name)
                .replace('${version}', pkg.version)
                .replace('${year}', new Date().getFullYear())
const baseCfg = {
  entry: resolve(__dirname, '../src/index.js'),
  plugins: [
    alias(aliaCfg)
  ]
}
const builds = {
  'dev-cjs': {
    dest: join(__dirname, '../', pkg.main),
    format: 'cjs'
  },
  'dev-umd': {
    dest: resolve(__dirname, '../dist/lp.umd.js'),
    format: 'umd',
    noConflict: true,
    moduleName: 'Promise'
  },
  'prod': {
    dest: resolve(__dirname, '../dist/lp.min.js'),
    format: 'umd',
    noConflict: true,
    moduleName: 'Promise',
    sourceMap: true
  }
}

export default (buildEnv => {
  if (buildEnv) {
    return Object.assign({}, {
      entry: baseCfg.entry,
      plugins: [
        ...baseCfg.plugins,
        uglify({ 
          output: { preamble: banner }
        })
      ]
    }, builds[buildEnv])
  } else {
    return Object.assign({}, baseCfg, {
      targets: Object.keys(builds).filter(name => name.indexOf('dev') !== -1).map(name => builds[name]),
      banner
    })
  }
})(process.env.BUILD)