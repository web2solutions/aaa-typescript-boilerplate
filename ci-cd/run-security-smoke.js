/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CANDIDATE_SECURITY_ROOTS = ['apps/backend-template/test/unit', 'test/unit'];
const SECURITY_TEST_SUFFIXES = [
  'config/security.test.ts',
  'shared/utils.errorExposure.test.ts'
];

function run() {
  const root = process.cwd();
  const existingTests = CANDIDATE_SECURITY_ROOTS.reduce((found, candidateRoot) => {
    if (found.length > 0) {
      return found;
    }

    if (!fs.existsSync(path.join(root, candidateRoot))) {
      return found;
    }

    const testsForRoot = SECURITY_TEST_SUFFIXES
      .map((suffix) => path.join(candidateRoot, suffix))
      .filter((target) => fs.existsSync(path.join(root, target)));

    return testsForRoot;
  }, []);

  if (existingTests.length === 0) {
    console.error('[ci] security smoke: no matching tests were found.');
    const expected = CANDIDATE_SECURITY_ROOTS
      .flatMap((candidateRoot) => SECURITY_TEST_SUFFIXES.map((suffix) => `${candidateRoot}/${suffix}`))
      .join(', ');
    console.error(`[ci] expected one of: ${expected}`);
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
