/* eslint-disable @typescript-eslint/no-var-requires */
const {
  validateRootReleaseScripts,
  validatePackageReleaseMetadata
} = require('../../../ci-cd/check-release-governance');

describe('check-release-governance', () => {
  it('accepts required root release scripts', () => {
    expect.hasAssertions();
    const failures = validateRootReleaseScripts({
      scripts: {
        'changelog:update': 'node ci-cd/update-changelog.js',
        'changelog:check': 'node ci-cd/update-changelog.js --check',
        'release:dry-run': 'node ci-cd/release-dry-run.js all',
        'release:dry-run:packages': 'node ci-cd/release-dry-run.js packages',
        'release:dry-run:apps': 'node ci-cd/release-dry-run.js apps'
      }
    });
    expect(failures).toStrictEqual([]);
  });

  it('rejects missing root release scripts', () => {
    expect.hasAssertions();
    const failures = validateRootReleaseScripts({ scripts: {} });
    expect(failures).toStrictEqual([
      '[root] missing required release script: changelog:update',
      '[root] missing required release script: changelog:check',
      '[root] missing required release script: release:dry-run',
      '[root] missing required release script: release:dry-run:packages',
      '[root] missing required release script: release:dry-run:apps'
    ]);
  });

  it('accepts private package without files field when semver is valid', () => {
    expect.hasAssertions();
    const failures = validatePackageReleaseMetadata({
      name: '@jumentix/private-app',
      version: '1.0.0',
      private: true
    }, 'apps/private-app');
    expect(failures).toStrictEqual([]);
  });

  it('rejects non-private package with invalid version and missing files', () => {
    expect.hasAssertions();
    const failures = validatePackageReleaseMetadata({
      name: '@jumentix/publishable',
      version: '1.0',
      private: false
    }, 'packages/publishable');
    expect(failures).toStrictEqual([
      '[@jumentix/publishable] invalid semver version: 1.0',
      '[@jumentix/publishable] publishable package must define non-empty files field'
    ]);
  });
});
