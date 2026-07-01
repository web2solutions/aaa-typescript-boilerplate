/* eslint-disable no-console */
const { execSync } = require('child_process');

const ROOT_MARKERS = [
  'package.json',
  'pnpm-workspace.yaml',
  '.circleci/config.yml',
  '.github/workflows',
  'ci-cd',
  'tsconfig',
  'jest.config',
  '.npmrc'
];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/').trim();
}

function isDocsOnlyPath(filePath) {
  if (!filePath) return false;
  if (filePath.startsWith('documentation/')) return true;
  if (filePath.startsWith('.agents/')) return true;
  if (filePath.endsWith('.md')) return true;
  if (filePath.endsWith('.mdx')) return true;
  return false;
}

function computeAffectedWorkspaces(files) {
  const normalized = files.map(normalizePath).filter(Boolean);
  const affected = {
    root: false,
    apps: [],
    packages: [],
    docsOnly: normalized.length > 0 && normalized.every(isDocsOnlyPath),
    files: normalized
  };

  const appsSet = new Set();
  const packagesSet = new Set();

  for (const file of normalized) {
    if (ROOT_MARKERS.some((marker) => file === marker || file.startsWith(`${marker}/`))) {
      affected.root = true;
    }

    if (file.startsWith('apps/')) {
      const [_, appName] = file.split('/');
      if (appName) appsSet.add(appName);
      continue;
    }

    if (file.startsWith('packages/')) {
      const [__, packageName] = file.split('/');
      if (packageName) packagesSet.add(packageName);
    }
  }

  affected.apps = Array.from(appsSet).sort();
  affected.packages = Array.from(packagesSet).sort();
  return affected;
}

function readChangedFiles(baseRef = 'origin/dev') {
  const output = execSync(`git diff --name-only ${baseRef}...HEAD`, { encoding: 'utf8' });
  return output.split('\n').map((line) => line.trim()).filter(Boolean);
}

function run() {
  const baseRef = process.env.AAA_CI_BASE_REF || 'origin/dev';
  const files = process.argv.slice(2);
  const changedFiles = files.length > 0 ? files : readChangedFiles(baseRef);
  const result = computeAffectedWorkspaces(changedFiles);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  run();
}

module.exports = {
  computeAffectedWorkspaces,
  isDocsOnlyPath,
  normalizePath
};
