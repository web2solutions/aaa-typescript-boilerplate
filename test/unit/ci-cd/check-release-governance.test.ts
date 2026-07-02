/* eslint-disable @typescript-eslint/no-var-requires */
const {
  validateReleasePolicy,
  validateRootReleaseScripts,
  validatePackageReleaseMetadata,
  validateAppReleaseMetadata
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

  it('accepts release policy when package/app strategies are valid', () => {
    expect.hasAssertions();
    const failures = validateReleasePolicy({
      packageVersioning: 'independent',
      appVersioning: 'locked',
      appLockedVersion: '0.0.2'
    }, { version: '0.0.2' });
    expect(failures).toStrictEqual([]);
  });

  it('rejects invalid release policy values', () => {
    expect.hasAssertions();
    const failures = validateReleasePolicy({
      packageVersioning: 'locked',
      appVersioning: 'independent',
      appLockedVersion: '0.0'
    }, { version: '0.0.2' });
    expect(failures).toStrictEqual([
      '[release-policy] packageVersioning must be "independent"',
      '[release-policy] appVersioning must be "locked"',
      '[release-policy] appLockedVersion must be a valid semver, got: 0.0',
      '[release-policy] appLockedVersion must match root package version (0.0.2)'
    ]);
  });

  it('accepts app metadata when app is private and version is locked', () => {
    expect.hasAssertions();
    const failures = validateAppReleaseMetadata({
      name: '@jumentix/service-management',
      version: '0.0.2',
      private: true
    }, 'apps/service-management', { appLockedVersion: '0.0.2' });
    expect(failures).toStrictEqual([]);
  });

  it('rejects app metadata when app is public or unlocked version', () => {
    expect.hasAssertions();
    const failures = validateAppReleaseMetadata({
      name: '@jumentix/service-management',
      version: '0.0.1',
      private: false
    }, 'apps/service-management', { appLockedVersion: '0.0.2' });
    expect(failures).toStrictEqual([
      '[@jumentix/service-management] app workspace must be private',
      '[@jumentix/service-management] app version must match release-policy appLockedVersion (0.0.2)'
    ]);
  });
});
