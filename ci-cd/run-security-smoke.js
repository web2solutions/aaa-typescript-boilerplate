/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CANDIDATE_TEST_FILES = [
  'apps/backend-template/test/unit/config/security.test.ts',
  'apps/backend-template/test/unit/shared/utils.errorExposure.test.ts',
  'test/unit/config/security.test.ts',
  'test/unit/shared/utils.errorExposure.test.ts'
];

function run() {
  const root = process.cwd();
  const existingTests = CANDIDATE_TEST_FILES
    .map((target) => path.join(root, target))
    .filter((absolutePath) => fs.existsSync(absolutePath))
    .map((absolutePath) => path.relative(root, absolutePath));

  if (existingTests.length === 0) {
    console.error('[ci] security smoke: no matching tests were found.');
    console.error(`[ci] expected one of: ${CANDIDATE_TEST_FILES.join(', ')}`);
    process.exit(1);
  }

  console.log(`[ci] security smoke targets: ${existingTests.join(', ')}`);

  const result = spawnSync('jest', [...existingTests, '--runInBand', '--coverage=false'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'ci' }
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run();
