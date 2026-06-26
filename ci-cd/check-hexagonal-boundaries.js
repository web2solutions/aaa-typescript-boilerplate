/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTROLLERS_ROOT = path.resolve(ROOT, 'src/modules');
const ALLOWED_SERVICE_IMPORT = /\/service\/ports\//;

const walk = (dirPath, files = []) => {
  if (!fs.existsSync(dirPath)) return files;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(absPath, files);
      continue;
    }
    if (
      entry.name.endsWith('.ts')
      && absPath.includes(`${path.sep}interface${path.sep}controller${path.sep}`)
    ) {
      files.push(absPath);
    }
  }
  return files;
};

const readImports = (content) => {
  const imports = [];
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  let match = importRegex.exec(content);
  while (match) {
    imports.push(match[1]);
    match = importRegex.exec(content);
  }
  return imports;
};

const controllerFiles = walk(CONTROLLERS_ROOT);
const violations = [];

for (const controllerFile of controllerFiles) {
  const source = fs.readFileSync(controllerFile, 'utf8');
  const imports = readImports(source);
  const relative = path.relative(ROOT, controllerFile);

  for (const importPath of imports) {
    if (importPath.includes('/infra/repository/')) {
      violations.push(`${relative}: forbidden controller import "${importPath}"`);
    }

    if (importPath.includes('/service/') && !ALLOWED_SERVICE_IMPORT.test(importPath)) {
      violations.push(`${relative}: controller must not import service implementation "${importPath}"`);
    }
  }

  const hasServiceInstantiation = /new\s+[A-Za-z0-9_]*Service\s*\(/.test(source);
  if (hasServiceInstantiation) {
    violations.push(`${relative}: controller must not instantiate Service directly`);
  }

  const hasRepositoryInstantiation = /new\s+[A-Za-z0-9_]*Repositor(y|ies)\s*\(/.test(source);
  if (hasRepositoryInstantiation) {
    violations.push(`${relative}: controller must not instantiate Repository directly`);
  }

  const hasServiceCompile = /[A-Za-z0-9_]*Service\.compile\s*\(/.test(source);
  if (hasServiceCompile) {
    violations.push(`${relative}: controller must not call Service.compile directly`);
  }

  const hasRepositoryCompile = /[A-Za-z0-9_]*Repositor(y|ies)\.compile\s*\(/.test(source);
  if (hasRepositoryCompile) {
    violations.push(`${relative}: controller must not call Repository.compile directly`);
  }
}

if (violations.length > 0) {
  console.error('Hexagonal boundary violations found:');
  violations.forEach((violation) => console.error(`- ${violation}`));
  process.exit(1);
}

console.log('Hexagonal boundary check passed.');
