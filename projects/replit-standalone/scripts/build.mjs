import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const rootDir = process.cwd()
const srcDir = path.join(rootDir, 'src')
const distDir = path.join(rootDir, 'dist')
const assetsDir = path.join(distDir, 'assets')
const entryFile = path.join(srcDir, 'main.tsx')

const moduleCache = new Map()

const extensionCandidates = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css']

await fs.rm(distDir, { recursive: true, force: true })
await fs.mkdir(assetsDir, { recursive: true })

const entryId = await collectModule(entryFile)

await emitCssBundle()
await emitJsBundle(entryId)
await emitHtml()

async function emitCssBundle() {
  const cssFiles = [path.join(srcDir, 'index.css'), path.join(srcDir, 'App.css')]
  const parts = await Promise.all(cssFiles.map((file) => fs.readFile(file, 'utf8')))
  await fs.writeFile(path.join(assetsDir, 'styles.css'), `${parts.join('\n\n')}\n`, 'utf8')
}

async function emitHtml() {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mission Control</title>
    <link rel="stylesheet" href="./assets/styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="./assets/app.js"></script>
  </body>
</html>
`

  await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8')
}

async function emitJsBundle(entryModuleId) {
  const modulesObject = Array.from(moduleCache.values())
    .map((record) => `${JSON.stringify(record.id)}: [function(require, module, exports) {\n${record.code}\n}, ${JSON.stringify(record.deps)}]`)
    .join(',\n')

  const bundle = `(function() {
const modules = {
${modulesObject}
};
const cache = Object.create(null);
if (!globalThis.process) {
  globalThis.process = { env: {} };
}
globalThis.process.env.NODE_ENV = 'production';
function requireModule(id) {
  if (cache[id]) {
    return cache[id].exports;
  }
  const definition = modules[id];
  if (!definition) {
    throw new Error('Module not found: ' + id);
  }
  const [factory, deps] = definition;
  const module = { exports: {} };
  cache[id] = module;
  factory(function(specifier) {
    return requireModule(deps[specifier]);
  }, module, module.exports);
  return module.exports;
}
requireModule(${JSON.stringify(entryModuleId)});
})();`

  await fs.writeFile(path.join(assetsDir, 'app.js'), bundle, 'utf8')
}

async function collectModule(filePath) {
  const normalizedPath = normalizePath(filePath)
  if (moduleCache.has(normalizedPath)) {
    return normalizedPath
  }

  const extension = path.extname(filePath)
  if (extension === '.css') {
    moduleCache.set(normalizedPath, {
      id: normalizedPath,
      code: '',
      deps: {},
    })
    return normalizedPath
  }

  if (extension === '.json') {
    const rawJson = await fs.readFile(filePath, 'utf8')
    moduleCache.set(normalizedPath, {
      id: normalizedPath,
      code: `module.exports = ${rawJson.trim()};`,
      deps: {},
    })
    return normalizedPath
  }

  const source = await fs.readFile(filePath, 'utf8')
  const transpiled = transpileSource(filePath, source)
  const deps = {}
  const requires = [...transpiled.matchAll(/require\((['"])(.+?)\1\)/g)]

  for (const match of requires) {
    const specifier = match[2]
    const resolvedPath = await resolveSpecifier(specifier, path.dirname(filePath))
    deps[specifier] = await collectModule(resolvedPath)
  }

  moduleCache.set(normalizedPath, {
    id: normalizedPath,
    code: transpiled,
    deps,
  })

  return normalizedPath
}

function transpileSource(filePath, source) {
  if (/\.(c?js|mjs)$/i.test(filePath)) {
    return source
  }

  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  }).outputText
}

async function resolveSpecifier(specifier, importerDir) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    return resolveFile(path.resolve(importerDir, specifier))
  }

  const { packageName, subpath } = splitPackageSpecifier(specifier)
  const packageRoot = path.join(rootDir, 'node_modules', packageName)
  const packageJsonPath = path.join(packageRoot, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  const exportTarget = resolvePackageExport(packageJson, subpath)

  if (exportTarget) {
    return resolveFile(path.join(packageRoot, exportTarget))
  }

  if (subpath) {
    return resolveFile(path.join(packageRoot, subpath))
  }

  return resolveFile(path.join(packageRoot, packageJson.main ?? 'index.js'))
}

function splitPackageSpecifier(specifier) {
  if (specifier.startsWith('@')) {
    const segments = specifier.split('/')
    return {
      packageName: segments.slice(0, 2).join('/'),
      subpath: segments.slice(2).join('/'),
    }
  }

  const segments = specifier.split('/')
  return {
    packageName: segments[0],
    subpath: segments.slice(1).join('/'),
  }
}

function resolvePackageExport(packageJson, subpath) {
  const exportKey = subpath ? `./${subpath}` : '.'
  const exportValue = packageJson.exports?.[exportKey]

  if (typeof exportValue === 'string') {
    return exportValue
  }

  if (exportValue && typeof exportValue === 'object') {
    if (typeof exportValue.default === 'string') {
      return exportValue.default
    }

    for (const candidate of ['browser', 'import', 'require']) {
      if (typeof exportValue[candidate] === 'string') {
        return exportValue[candidate]
      }
    }
  }

  return null
}

async function resolveFile(basePath) {
  const directMatch = await pathExists(basePath)
  if (directMatch) {
    return basePath
  }

  for (const extension of extensionCandidates) {
    const candidate = `${basePath}${extension}`
    if (await pathExists(candidate)) {
      return candidate
    }
  }

  for (const extension of extensionCandidates) {
    const indexCandidate = path.join(basePath, `index${extension}`)
    if (await pathExists(indexCandidate)) {
      return indexCandidate
    }
  }

  throw new Error(`Unable to resolve module: ${basePath}`)
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

function normalizePath(targetPath) {
  return targetPath.split(path.sep).join('/')
}
