/* eslint-disable @typescript-eslint/no-var-requires */
const { validatePackageScripts } = require('../../../ci-cd/check-workspace-quality');

describe('check-workspace-quality', () => {
  it('accepts package when required scripts exist', () => {
    expect.hasAssertions();
    const failures = validatePackageScripts({
      name: '@jumentix/example',
      scripts: {
        build: 'tsc -p tsconfig.json',
        test: 'npm run typecheck',
        typecheck: 'tsc --noEmit'
      }
    }, 'packages/example');
    expect(failures).toStrictEqual([]);
  });

  it('rejects missing scripts and placeholder smoke test', () => {
    expect.hasAssertions();
    const failures = validatePackageScripts({
      name: '@jumentix/example',
      scripts: {
        build: 'tsc -p tsconfig.json',
        test: 'node -e "console.log(\'smoke ok\')"'
      }
    }, 'packages/example');
    expect(failures).toStrictEqual([
      '[@jumentix/example] missing required script: typecheck',
      '[@jumentix/example] test script uses placeholder smoke output'
    ]);
  });
});
