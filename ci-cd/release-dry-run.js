/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function runCommand(command, args, cwd = process.cwd()) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${String(result.status)}`);
  }
}

function readWorkspaceFolders(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  return fs.readdirSync(baseDir)
    .map((name) => path.join(baseDir, name))
    .filter((fullPath) => fs.statSync(fullPath).isDirectory());
}

function readPackageJson(targetDir) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return null;
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function dryRunPackages(packagesDir) {
  const packageDirs = readWorkspaceFolders(packagesDir);
  for (const packageDir of packageDirs) {
    const pkg = readPackageJson(packageDir);
    if (!pkg || pkg.private === true) continue;
    console.log(`\n[dry-run][package] ${pkg.name || packageDir}`);
    runCommand('npm', ['pack', '--dry-run', packageDir]);
  }
}

function dryRunApps(appsDir) {
  const appDirs = readWorkspaceFolders(appsDir);
  for (const appDir of appDirs) {
    const pkg = readPackageJson(appDir);
    if (!pkg) continue;
    const scripts = pkg.scripts || {};
    const hasBuild = typeof scripts.build === 'string' && scripts.build.trim().length > 0;
    const hasTest = typeof scripts.test === 'string' && scripts.test.trim().length > 0;
    if (!hasBuild || !hasTest) {
      throw new Error(`App workspace ${pkg.name || appDir} is missing required build/test scripts for release readiness.`);
    }
    console.log(`[dry-run][app] ${pkg.name || appDir} -> build/test scripts present`);
  }
}

function run() {
  const mode = (process.argv[2] || 'all').toLowerCase();
  const root = process.cwd();
  const packagesDir = path.join(root, 'packages');
  const appsDir = path.join(root, 'apps');

  if (!['all', 'packages', 'apps'].includes(mode)) {
    throw new Error(`Invalid mode "${mode}". Use one of: all, packages, apps.`);
  }

  if (mode === 'all' || mode === 'packages') {
    dryRunPackages(packagesDir);
  }

  if (mode === 'all' || mode === 'apps') {
    dryRunApps(appsDir);
  }

  console.log('\n[dry-run] release dry-run completed successfully.');
}

if (require.main === module) {
  run();
}

module.exports = {
  dryRunApps,
  dryRunPackages,
  readPackageJson
};
