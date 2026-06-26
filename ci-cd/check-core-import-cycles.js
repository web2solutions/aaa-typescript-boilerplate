/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.cjs'];
const CORE_DIRS = [
  'src/modules/Users/domain',
  'src/modules/Users/features',
  'src/modules/Users/service',
  'src/modules/Users/infra/repository',
  'src/modules/Users/composition',
  'src/modules/port'
].map((dir) => path.resolve(ROOT, dir));

const importRegex = /from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;

const isCoreFile = (filePath) => CORE_DIRS.some((dir) => filePath.startsWith(dir));

const toPosix = (value) => value.split(path.sep).join('/');

const walk = (dirPath, files = []) => {
  if (!fs.existsSync(dirPath)) return files;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(absPath, files);
      continue;
    }
    if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(absPath);
    }
  }
  return files;
};

const resolveImport = (sourceFile, specifier) => {
  let candidateBase;
  if (specifier.startsWith('@src/')) {
    candidateBase = path.resolve(ROOT, 'src', specifier.slice('@src/'.length));
  } else if (specifier.startsWith('.')) {
    candidateBase = path.resolve(path.dirname(sourceFile), specifier);
  } else {
    return null;
  }

  const candidates = [
    candidateBase,
    ...EXTENSIONS.map((ext) => `${candidateBase}${ext}`),
    ...EXTENSIONS.map((ext) => path.join(candidateBase, `index${ext}`))
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.resolve(candidate);
    }
  }
  return null;
};

const allCoreFiles = CORE_DIRS.flatMap((dir) => walk(dir)).filter(isCoreFile);
const coreSet = new Set(allCoreFiles.map((file) => path.resolve(file)));
const graph = new Map();

for (const file of coreSet) {
  const content = fs.readFileSync(file, 'utf8');
  const deps = new Set();
  importRegex.lastIndex = 0;
  let match = importRegex.exec(content);
  while (match) {
    const specifier = match[1] || match[2];
    const resolved = resolveImport(file, specifier);
    if (resolved && coreSet.has(resolved)) {
      deps.add(resolved);
    }
    match = importRegex.exec(content);
  }
  graph.set(file, [...deps]);
}

const color = new Map();
const stack = [];
const cycleKeys = new Set();
const cycles = [];

const visit = (node) => {
  color.set(node, 1);
  stack.push(node);

  for (const neighbor of graph.get(node) || []) {
    const state = color.get(neighbor) || 0;
    if (state === 0) {
      visit(neighbor);
      continue;
    }
    if (state === 1) {
      const start = stack.indexOf(neighbor);
      if (start >= 0) {
        const cycle = [...stack.slice(start), neighbor];
        const key = cycle.join('->');
        if (!cycleKeys.has(key)) {
          cycleKeys.add(key);
          cycles.push(cycle);
        }
      }
    }
  }

  stack.pop();
  color.set(node, 2);
};

for (const node of graph.keys()) {
  if ((color.get(node) || 0) === 0) {
    visit(node);
  }
}

if (cycles.length > 0) {
  console.error('Core import cycle(s) found:');
  cycles.forEach((cycle, idx) => {
    console.error(`\n${idx + 1}. ${cycle.map((file) => toPosix(path.relative(ROOT, file))).join(' -> ')}`);
  });
  process.exit(1);
}

console.log('Core import cycle check passed.');
