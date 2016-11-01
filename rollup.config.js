import { readFileSync } from 'fs'
import uglify from 'rollup-plugin-uglify'

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
const banner = readFileSync('src/banner.js', 'utf-8')
                .replace('${moduleName}', pkg.name)
                .replace('${version}', pkg.version)
                .replace('${year}', new Date().getFullYear())
let config

switch(process.env.BUILD) {
  case 'prod':
    config = {
      plugins: [ 
        uglify({ 
          output: { preamble: banner } 
        }) 
      ],
      dest: 'dist/lp.min.js',
      format: 'umd',
      noConflict: true,
      moduleName: 'Promise',
      sourceMap: true
    }
    break
  default:
    config = {
      targets: [
        {
          dest: 'dist/lp.umd.js',
          format: 'umd',
          noConflict: true,
          moduleName: 'Promise'
        }, {
          dest: pkg.main,
          format: 'cjs'
        }
      ],
      banner: banner
    }
    break
}

config.entry = 'src/index.js'

export default config