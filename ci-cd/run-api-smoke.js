/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CANDIDATE_SMOKE_TESTS = [
  'apps/backend-template/test/integration/Express/get.localhost.test.ts',
  'test/integration/Express/get.localhost.test.ts'
];

function run() {
  const root = process.cwd();
  const testFile = CANDIDATE_SMOKE_TESTS.find((target) => fs.existsSync(path.join(root, target)));

  if (!testFile) {
    console.error('[ci] api smoke: missing localhost smoke test file.');
    console.error(`[ci] expected one of: ${CANDIDATE_SMOKE_TESTS.join(', ')}`);
    process.exit(1);
  }

  console.log(`[ci] api smoke target: ${testFile}`);

  const result = spawnSync('jest', [testFile, '--runInBand', '--coverage=false'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'ci' }
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run();
