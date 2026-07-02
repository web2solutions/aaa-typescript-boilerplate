/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTROLLERS_ROOT = path.resolve(ROOT, 'src/modules');
const ALLOWED_SERVICE_IMPORT = /\/service\/ports\//;
const CONTROLLER_PATH_MARKERS = [
  `${path.sep}interface${path.sep}controller${path.sep}`,
  `${path.sep}adapters${path.sep}in${path.sep}http${path.sep}controllers${path.sep}`
];

const walk = (dirPath, files = []) => {
  if (!fs.existsSync(dirPath)) return files;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(absPath, files);
      continue;
    }
    const isControllerFile = CONTROLLER_PATH_MARKERS.some((marker) => absPath.includes(marker));
    if (entry.name.endsWith('.ts') && isControllerFile) {
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

const hasUseCaseImport = (imports) => imports.some(
  (importPath) => importPath.includes('/application/ports/') || importPath.includes('/application/use-cases/')
);

function validateControllerFile(source, imports, relativePath) {
  const violations = [];

  for (const importPath of imports) {
    if (importPath.includes('/infra/repository/')) {
      violations.push(`${relativePath}: forbidden controller import "${importPath}"`);
    }

    if (importPath.includes('/service/') && !ALLOWED_SERVICE_IMPORT.test(importPath)) {
      violations.push(`${relativePath}: controller must not import service implementation "${importPath}"`);
    }
  }

  const isHttpController = relativePath.includes('/adapters/in/http/controllers/');
  const isHttpControllerIndex = isHttpController && /\/index\.ts$/.test(relativePath);
  if (isHttpController && !isHttpControllerIndex && !hasUseCaseImport(imports)) {
    violations.push(`${relativePath}: HTTP controller must import application use-case contract`);
  }

  const hasServiceInstantiation = /new\s+[A-Za-z0-9_]*Service\s*\(/.test(source);
  if (hasServiceInstantiation) {
    violations.push(`${relativePath}: controller must not instantiate Service directly`);
  }

  const hasRepositoryInstantiation = /new\s+[A-Za-z0-9_]*Repositor(y|ies)\s*\(/.test(source);
  if (hasRepositoryInstantiation) {
    violations.push(`${relativePath}: controller must not instantiate Repository directly`);
  }

  const hasServiceCompile = /[A-Za-z0-9_]*Service\.compile\s*\(/.test(source);
  if (hasServiceCompile) {
    violations.push(`${relativePath}: controller must not call Service.compile directly`);
  }

  const hasRepositoryCompile = /[A-Za-z0-9_]*Repositor(y|ies)\.compile\s*\(/.test(source);
  if (hasRepositoryCompile) {
    violations.push(`${relativePath}: controller must not call Repository.compile directly`);
  }

  return violations;
}

function run() {
  const controllerFiles = walk(CONTROLLERS_ROOT);
  const violations = [];

  for (const controllerFile of controllerFiles) {
    const source = fs.readFileSync(controllerFile, 'utf8');
    const imports = readImports(source);
    const relative = path.relative(ROOT, controllerFile);
    violations.push(...validateControllerFile(source, imports, relative));
  }

  if (violations.length > 0) {
    console.error('Hexagonal boundary violations found:');
    violations.forEach((violation) => console.error(`- ${violation}`));
    process.exit(1);
  }

  console.log('Hexagonal boundary check passed.');
}

if (require.main === module) {
  run();
}

module.exports = {
  validateControllerFile,
  readImports
};
