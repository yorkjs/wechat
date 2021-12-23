// 根据 tsconfig.json 把 ts 转成 js
import typescript from 'rollup-plugin-typescript2'
// 替换代码中的变量
import replace from '@rollup/plugin-replace'
// 输出打包后的文件大小
import filesize from 'rollup-plugin-filesize'
// ES6 转 ES5
import buble from '@rollup/plugin-buble'
// 压缩
import { terser } from 'rollup-plugin-terser'

import { name, version, author, license } from './package.json'

const moduleName = name.split('/').pop()

const startYear = 2021
const currentYear = new Date().getFullYear()
const yearRange = [currentYear]

if (startYear != currentYear) {
  yearRange.unshift(startYear)
}

const banner =
  `${'/**\n' + ' * '}${moduleName}.js v${version}\n` +
  ` * (c) ${yearRange.join('-')} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */\n`;

const sourcemap = true

let suffix = '.js'

const env = process.env.NODE_ENV
const minify = process.env.NODE_MINIFY === 'true'

const replaces = {
  'process.env.NODE_ENV': JSON.stringify(env),
  'process.env.NODE_VERSION': JSON.stringify(version),
  preventAssignment: true
}

let plugins = [
  replace(replaces),
]

if (minify) {
  suffix = '.min' + suffix
}

const output = []

if (process.env.NODE_FORMAT === 'es') {
  plugins.push(
    typescript({
      check: false,
      useTsconfigDeclarationDir: true
    })
  )
  output.push({
    file: `dist/${moduleName}.esm${suffix}`,
    format: 'es',
    interop: false,
    banner,
    sourcemap,
  })
}
else {
  plugins.push(
    typescript({
      check: false,
      useTsconfigDeclarationDir: true
    }),
    buble({
      namedFunctionExpressions: false
    })
  )
  output.push({
    file: `dist/${moduleName}${suffix}`,
    format: 'umd',
    name: 'Url',
    interop: false,
    banner,
    sourcemap,
  })
}

if (minify) {
  plugins.push(
    terser()
  )
}

plugins.push(
  filesize(),
)

module.exports = [
  {
    input: 'src/index.ts',
    external: ['url'],
    output,
    plugins
  }
]