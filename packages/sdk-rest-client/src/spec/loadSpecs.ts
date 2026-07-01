import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface ILoadedSpecs {
  openApi: Record<string, any>;
}

export const loadSpecs = (
  basePath = path.resolve(process.cwd(), 'spec')
): ILoadedSpecs => {
  const openApiPath = path.join(basePath, '1.0.0.yml');

  return {
    openApi: YAML.parse(fs.readFileSync(openApiPath, 'utf8'))
  };
};
