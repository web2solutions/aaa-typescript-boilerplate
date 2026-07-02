/* eslint-disable @typescript-eslint/no-var-requires */
const {
  validateControllerFile,
  readImports
} = require('../../../ci-cd/check-hexagonal-boundaries');

describe('check-hexagonal-boundaries', () => {
  it('parses import statements', () => {
    expect.hasAssertions();
    const imports = readImports(`
      import { A } from "@src/modules/Users/application/ports/IUserUseCases";
      import { B } from "@src/interface/HTTP/ports";
    `);
    expect(imports).toStrictEqual([
      '@src/modules/Users/application/ports/IUserUseCases',
      '@src/interface/HTTP/ports'
    ]);
  });

  it('flags forbidden controller patterns', () => {
    expect.hasAssertions();
    const source = `
      import { UserService } from "@src/modules/Users/service/UserService";
      export class BrokenController {
        constructor() {
          const service = new UserService();
          return service;
        }
      }
    `;
    const violations = validateControllerFile(
      source,
      readImports(source),
      'src/modules/Users/adapters/in/http/controllers/BrokenController.ts'
    );

    expect(violations).toContain(
      'src/modules/Users/adapters/in/http/controllers/BrokenController.ts: controller must not import service implementation "@src/modules/Users/service/UserService"'
    );
    expect(violations).toContain(
      'src/modules/Users/adapters/in/http/controllers/BrokenController.ts: HTTP controller must import application use-case contract'
    );
    expect(violations).toContain(
      'src/modules/Users/adapters/in/http/controllers/BrokenController.ts: controller must not instantiate Service directly'
    );
  });

  it('accepts HTTP controller importing application use-case port', () => {
    expect.hasAssertions();
    const source = `
      import { IUserUseCases } from "@src/modules/Users/application/ports/IUserUseCases";
      export class UserController {
        constructor(private readonly useCases: IUserUseCases) {}
      }
    `;
    const violations = validateControllerFile(
      source,
      readImports(source),
      'src/modules/Users/adapters/in/http/controllers/UserController.ts'
    );
    expect(violations).toStrictEqual([]);
  });
});
