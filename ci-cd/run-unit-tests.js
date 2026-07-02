/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CANDIDATE_UNIT_DIRS = ['apps/backend-template/test/unit', 'test/unit'];

function run() {
  const root = process.cwd();
  const testTarget = CANDIDATE_UNIT_DIRS.find((target) => fs.existsSync(path.join(root, target)));

  if (!testTarget) {
    console.error('[ci] unit tests: no test directories found.');
    console.error(`[ci] expected one of: ${CANDIDATE_UNIT_DIRS.join(', ')}`);
    process.exit(1);
  }

  console.log(`[ci] unit tests target: ${testTarget}`);

  const result = spawnSync('jest', [testTarget, '--runInBand'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'dev' }
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run();
