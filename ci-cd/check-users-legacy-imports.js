/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const IMPORT_PATTERN = /from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\)/g;

const LEGACY_PATHS = [
  '@src/modules/Users/interface/controller/',
  '@src/modules/Users/infra/repository/'
];

const ALLOWLIST = new Set([
  path.resolve(ROOT, 'src/modules/Users/adapters/in/http/controllers/UserController.ts'),
  path.resolve(ROOT, 'src/modules/Users/adapters/in/http/controllers/AuthController.ts')
]);

const walk = (dirPath, files = []) => {
  if (!fs.existsSync(dirPath)) return files;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(absPath, files);
      continue;
    }
    if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absPath);
    }
  }
  return files;
};

const files = [
  ...walk(path.resolve(ROOT, 'src')),
  ...walk(path.resolve(ROOT, 'test'))
];

const violations = [];

for (const filePath of files) {
  if (ALLOWLIST.has(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  IMPORT_PATTERN.lastIndex = 0;
  let match = IMPORT_PATTERN.exec(content);
  while (match) {
    const importPath = match[1] || match[2];
    if (LEGACY_PATHS.some((legacyPath) => importPath.includes(legacyPath))) {
      violations.push(`${path.relative(ROOT, filePath)} imports legacy path "${importPath}"`);
    }
    match = IMPORT_PATTERN.exec(content);
  }
}

if (violations.length > 0) {
  console.error('Legacy Users namespace imports found:');
  violations.forEach((violation) => console.error(`- ${violation}`));
  process.exit(1);
}

console.log('Users legacy import check passed.');
