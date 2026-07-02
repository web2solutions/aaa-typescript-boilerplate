/* eslint-disable @typescript-eslint/no-var-requires */
const { resolveCiPlan } = require('../../../ci-cd/run-monorepo-ci');

describe('run-monorepo-ci', () => {
  it('returns docs-only lightweight plan', () => {
    expect.hasAssertions();
    const plan = resolveCiPlan({
      root: false,
      apps: [],
      packages: [],
      docsOnly: true,
      files: ['README.md']
    });

    expect(plan).toStrictEqual([
      ['npm', ['run', 'lint']],
      ['npm', ['run', 'changelog:check']]
    ]);
  });

  it('returns strict gate plus app/package scoped commands', () => {
    expect.hasAssertions();
    const plan = resolveCiPlan({
      root: false,
      apps: ['backend-template'],
      packages: ['sdk-rest-client'],
      docsOnly: false,
      files: ['apps/backend-template/package.json', 'packages/sdk-rest-client/src/index.ts']
    });

    expect(plan).toStrictEqual([
      ['npm', ['run', 'ci:gate:strict']],
      ['npm', ['run', 'build', '--prefix', 'apps/backend-template']],
      ['npm', ['run', 'test', '--prefix', 'apps/backend-template']],
      ['npm', ['run', 'build', '--prefix', 'packages/sdk-rest-client']],
      ['npm', ['run', 'test', '--prefix', 'packages/sdk-rest-client']]
    ]);
  });
});
