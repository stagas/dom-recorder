const fs = require('fs')
const { pullConfigs } = require('pull-configs')

const local = __dirname + '/'
const remote = 'https://github.com/stagas/typescript-minimal-template/raw/main/'

const { assign, omit, sort, merge, replace } = pullConfigs(remote, local)

merge('package.json', (prev, next) => {
  // deprecated: now using ~/.trusted-npm-deps per system configuration
  delete prev.trustedDependencies

  prev.types = next.types
  prev.scripts = next.scripts
  prev.files = next.files
  sort(assign(prev.devDependencies, next.devDependencies))

  // never used it - OTR screen acts like review so
  // it can be accidentally published anyway. also i dont care
  delete prev.private

  // deprecated
  delete prev.devDependencies['@stagas/documentation-fork']
  delete prev.devDependencies['@rollup/plugin-commonjs']
  delete prev.devDependencies['@stagas/sucrase-jest-plugin']
  delete prev.devDependencies['@web/dev-server-esbuild']
  delete prev.devDependencies['@web/dev-server-rollup']
  delete prev.devDependencies['@web/test-runner']
  delete prev.devDependencies['esbuild']
  delete prev.devDependencies['esbuild-register']
  delete prev.devDependencies['prettier']
  delete prev.devDependencies['terser']
  delete prev.devDependencies['vite-web-test-runner-plugin']
  delete prev.devDependencies['@swc-node/jest']
  delete prev.devDependencies['jest']
  delete prev.devDependencies['jest-browser-globals']
  delete prev.devDependencies['ts-jest']
  delete prev.devDependencies['ts-node']
  delete prev.devDependencies['wtr-plugin-vite']
  delete prev.devDependencies['@stagas/jest-node-exports-resolver']
  delete prev.devDependencies['vite-open']
})
replace('.gitattributes')
replace('.gitignore')
replace('.npmrc')
replace('.eslintrc.js')
replace('.pull-configs.js')
replace('.swcrc')
replace('dprint.json')
replace('tsconfig.json')
replace('tsconfig.dist.json')
replace('LICENSE')

const deprecated = [
  '.vscode/extensions.json',
  '.vscode',
  '.prettierrc',
  '.prettierignore',
  'example/tsconfig.json',
  'vite.config.js',
  'jest.config.js',
  'web-test-runner.config.js',
]
deprecated.forEach((x) => {
  try {
    fs.rmSync(x, { recursive: true })
    console.log('removed', x)
  } catch {}
})
