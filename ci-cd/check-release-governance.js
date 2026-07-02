/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getWorkspacePackageDirs(rootDir) {
  const packagesDir = path.join(rootDir, 'packages');
  if (!fs.existsSync(packagesDir)) return [];
  return fs.readdirSync(packagesDir)
    .map((name) => path.join(packagesDir, name))
    .filter((fullPath) => fs.statSync(fullPath).isDirectory());
}

function validateRootReleaseScripts(rootPackageJson) {
  const scripts = (rootPackageJson && rootPackageJson.scripts) || {};
  const requiredScripts = [
    'changelog:update',
    'changelog:check',
    'release:dry-run',
    'release:dry-run:packages',
    'release:dry-run:apps'
  ];
  const failures = [];

  for (const scriptName of requiredScripts) {
    const value = scripts[scriptName];
    if (typeof value !== 'string' || value.trim().length === 0) {
      failures.push(`[root] missing required release script: ${scriptName}`);
    }
  }

  return failures;
}

function validatePackageReleaseMetadata(pkg, packageDir) {
  const failures = [];
  const packageName = pkg.name || packageDir;

  if (!SEMVER_RE.test(String(pkg.version || ''))) {
    failures.push(`[${packageName}] invalid semver version: ${String(pkg.version || '')}`);
  }

  if (pkg.private !== true) {
    const filesField = pkg.files;
    if (!Array.isArray(filesField) || filesField.length === 0) {
      failures.push(`[${packageName}] publishable package must define non-empty files field`);
    }
  }

  return failures;
}

function run() {
  const rootDir = process.cwd();
  const rootPackageJson = readJson(path.join(rootDir, 'package.json'));
  const packageDirs = getWorkspacePackageDirs(rootDir);
  const failures = [];

  failures.push(...validateRootReleaseScripts(rootPackageJson));

  for (const packageDir of packageDirs) {
    const pkg = readJson(path.join(packageDir, 'package.json'));
    if (!pkg) continue;
    failures.push(...validatePackageReleaseMetadata(pkg, packageDir));
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exit(1);
  }

  console.log('Release governance check passed.');
}

if (require.main === module) {
  run();
}

module.exports = {
  validateRootReleaseScripts,
  validatePackageReleaseMetadata
};
