/* eslint-disable @typescript-eslint/no-var-requires */
const {
  computeAffectedWorkspaces,
  isDocsOnlyPath,
  normalizePath
} = require('../../../ci-cd/check-affected-workspaces');

describe('check-affected-workspaces', () => {
  it('normalizes paths and detects docs-only changes', () => {
    expect.hasAssertions();
    expect(normalizePath('\\documentation\\md\\README.md')).toBe('/documentation/md/README.md');
    expect(isDocsOnlyPath('documentation/md/file.md')).toBe(true);
    expect(isDocsOnlyPath('.agents/project-todos.md')).toBe(true);
    expect(isDocsOnlyPath('src/modules/Users/index.ts')).toBe(false);
  });

  it('computes affected apps/packages and root marker changes', () => {
    expect.hasAssertions();
    const result = computeAffectedWorkspaces([
      'apps/backend-template/src/index.ts',
      'packages/sdk-rest-client/src/index.ts',
      'ci-cd/check-affected-workspaces.js'
    ]);

    expect(result.root).toBe(true);
    expect(result.apps).toStrictEqual(['backend-template']);
    expect(result.packages).toStrictEqual(['sdk-rest-client']);
    expect(result.docsOnly).toBe(false);
  });

  it('returns docsOnly true when all files are docs scoped', () => {
    expect.hasAssertions();
    const result = computeAffectedWorkspaces([
      'documentation/md/JUMENTIX-MONOREPO-EXECUTION-PLAN.md',
      '.agents/project-todos.md',
      'README.md'
    ]);
    expect(result.docsOnly).toBe(true);
    expect(result.root).toBe(false);
    expect(result.apps).toStrictEqual([]);
    expect(result.packages).toStrictEqual([]);
  });
});
