/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function readPackageJson(targetDir) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return null;
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function getWorkspacePackageDirs(rootDir) {
  const packagesDir = path.join(rootDir, 'packages');
  if (!fs.existsSync(packagesDir)) return [];
  return fs.readdirSync(packagesDir)
    .map((name) => path.join(packagesDir, name))
    .filter((fullPath) => fs.statSync(fullPath).isDirectory());
}

function validatePackageScripts(pkg, packageDir) {
  const scripts = pkg.scripts || {};
  const required = ['build', 'test', 'typecheck'];
  const failures = [];

  for (const scriptName of required) {
    const scriptValue = scripts[scriptName];
    if (typeof scriptValue !== 'string' || scriptValue.trim().length === 0) {
      failures.push(`[${pkg.name || packageDir}] missing required script: ${scriptName}`);
    }
  }

  const testScript = String(scripts.test || '').toLowerCase();
  if (testScript.includes('smoke ok')) {
    failures.push(`[${pkg.name || packageDir}] test script uses placeholder smoke output`);
  }

  return failures;
}

function run() {
  const rootDir = process.cwd();
  const packageDirs = getWorkspacePackageDirs(rootDir);
  const failures = [];

  for (const packageDir of packageDirs) {
    const pkg = readPackageJson(packageDir);
    if (!pkg) continue;
    failures.push(...validatePackageScripts(pkg, packageDir));
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exit(1);
  }

  console.log('Workspace package quality check passed.');
}

if (require.main === module) {
  run();
}

module.exports = {
  getWorkspacePackageDirs,
  validatePackageScripts
};
