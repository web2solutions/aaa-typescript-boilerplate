#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const LCOV_PATH = path.join(ROOT, 'coverage', 'lcov.info');
const threshold = Number(process.env.PATCH_COVERAGE_THRESHOLD || '99');

const run = (cmd) => cp.execSync(cmd, {
  cwd: ROOT,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();

const resolveBaseRef = () => {
  const candidates = [
    'origin/main',
    'main'
  ];
  for (const candidate of candidates) {
    try {
      run(`git rev-parse --verify ${candidate}`);
      return candidate;
    } catch (error) {
      // keep trying candidates
    }
  }
  throw new Error('Could not resolve base ref (origin/main or main).');
};

const normalizeFilePath = (raw) => {
  if (!raw) return '';
  const clean = raw.replace(/\\/g, '/');
  if (path.isAbsolute(clean)) {
    return path.relative(ROOT, clean).replace(/\\/g, '/');
  }
  return clean.replace(/^\.\//, '');
};

const parseChangedLines = (diffText) => {
  const changed = new Map();
  let currentFile = '';
  let currentLine = 0;

  const ensure = (file) => {
    if (!changed.has(file)) changed.set(file, new Set());
    return changed.get(file);
  };

  for (const line of diffText.split('\n')) {
    if (line.startsWith('+++ b/')) {
      currentFile = normalizeFilePath(line.slice(6));
      continue;
    }
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)(?:,(\d+))?/);
      if (match) {
        currentLine = Number(match[1]);
      }
      continue;
    }
    if (!currentFile || !currentFile.endsWith('.ts')) continue;
    if (line.startsWith('+') && !line.startsWith('+++')) {
      ensure(currentFile).add(currentLine);
      currentLine += 1;
      continue;
    }
    if (line.startsWith('-') && !line.startsWith('---')) {
      continue;
    }
    currentLine += 1;
  }

  return changed;
};

const parseLcov = (lcovText) => {
  const fileLineHits = new Map();
  let currentFile = '';

  for (const line of lcovText.split('\n')) {
    if (line.startsWith('SF:')) {
      currentFile = normalizeFilePath(line.slice(3));
      if (!fileLineHits.has(currentFile)) fileLineHits.set(currentFile, new Map());
      continue;
    }
    if (line.startsWith('DA:') && currentFile) {
      const [lineNumberRaw, hitsRaw] = line.slice(3).split(',');
      const lineNumber = Number(lineNumberRaw);
      const hits = Number(hitsRaw);
      if (!Number.isNaN(lineNumber) && !Number.isNaN(hits)) {
        fileLineHits.get(currentFile).set(lineNumber, hits);
      }
    }
  }

  return fileLineHits;
};

const main = () => {
  if (!fs.existsSync(LCOV_PATH)) {
    throw new Error(`Coverage file not found at ${LCOV_PATH}. Run unit tests with coverage first.`);
  }

  const baseRef = resolveBaseRef();
  const diff = run(`git diff --unified=0 --no-color ${baseRef}...HEAD -- '*.ts'`);
  const changedLinesByFile = parseChangedLines(diff);
  const lcov = fs.readFileSync(LCOV_PATH, 'utf8');
  const lcovByFile = parseLcov(lcov);

  let covered = 0;
  let total = 0;
  const missing = [];

  for (const [file, lines] of changedLinesByFile.entries()) {
    const lineHits = lcovByFile.get(file);
    if (!lineHits) continue;
    for (const ln of lines.values()) {
      if (!lineHits.has(ln)) continue;
      total += 1;
      const hits = lineHits.get(ln);
      if (hits > 0) {
        covered += 1;
      } else {
        missing.push(`${file}:${ln}`);
      }
    }
  }

  if (total === 0) {
    console.log(`[patch-coverage] No changed executable TypeScript lines found. threshold=${threshold}%`);
    process.exit(0);
  }

  const pct = Number(((covered / total) * 100).toFixed(2));
  console.log(`[patch-coverage] ${pct}% (${covered}/${total}) threshold=${threshold}%`);

  if (pct < threshold) {
    console.error('[patch-coverage] FAIL: patch coverage below threshold.');
    if (missing.length > 0) {
      console.error('[patch-coverage] Missing lines:');
      missing.slice(0, 80).forEach((entry) => console.error(`  - ${entry}`));
      if (missing.length > 80) {
        console.error(`  ... and ${missing.length - 80} more`);
      }
    }
    process.exit(1);
  }

  console.log('[patch-coverage] PASS');
};

try {
  main();
} catch (error) {
  console.error('[patch-coverage] ERROR:', error.message);
  process.exit(1);
}
