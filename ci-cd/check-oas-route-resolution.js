/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const HTTP_METHODS = new Set(['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace']);
const FRAMEWORKS = ['express', 'fastify', 'restify', 'hyper-express'];

function fileExists(targetPath) {
  return fs.existsSync(targetPath);
}

function readSpecFiles(specDir) {
  return fs
    .readdirSync(specDir)
    .filter((fileName) => fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
    .map((fileName) => {
      const fullPath = path.join(specDir, fileName);
      const raw = fs.readFileSync(fullPath, 'utf8');
      return {
        fileName,
        document: YAML.parse(raw)
      };
    });
}

function getModuleNames(routePath) {
  const moduleNameRaw = routePath.split('/')[1];
  if (!moduleNameRaw) return null;
  if (moduleNameRaw === 'auth') {
    return {
      moduleName: 'Users',
      controllerName: 'AuthController'
    };
  }

  const singularName = moduleNameRaw.substring(0, moduleNameRaw.length - 1);
  return {
    moduleName: `${moduleNameRaw.charAt(0).toUpperCase()}${moduleNameRaw.substring(1)}`,
    controllerName: `${singularName.charAt(0).toUpperCase()}${singularName.substring(1)}Controller`
  };
}

function getControllerMethodsUsed(handlerSource) {
  const methods = new Set();
  const regex = /controller!?\.([A-Za-z0-9_]+)!?\s*\(/g;
  let match = regex.exec(handlerSource);
  while (match) {
    methods.add(match[1]);
    match = regex.exec(handlerSource);
  }
  return [...methods];
}

function controllerHasMethod(controllerSource, methodName) {
  const asyncRegex = new RegExp(`\\basync\\s+${methodName}\\s*\\(`);
  const normalRegex = new RegExp(`\\b${methodName}\\s*\\(`);
  return asyncRegex.test(controllerSource) || normalRegex.test(controllerSource);
}

function validateRouteResolution() {
  const root = process.cwd();
  const specDir = path.join(root, 'spec');
  const specs = readSpecFiles(specDir);
  const errors = [];

  specs.forEach(({ fileName, document }) => {
    const paths = document.paths || {};
    Object.entries(paths).forEach(([routePath, methods]) => {
      const moduleInfo = getModuleNames(routePath);
      if (!moduleInfo) {
        errors.push(`${fileName}: invalid route path "${routePath}"`);
        return;
      }

      const { moduleName, controllerName } = moduleInfo;
      const controllerFile = path.join(
        root,
        'src',
        'modules',
        moduleName,
        'interface',
        'controller',
        `${controllerName}.ts`
      );

      if (!fileExists(controllerFile)) {
        errors.push(`${fileName}: missing controller file for "${routePath}" -> ${controllerFile}`);
        return;
      }

      const controllerSource = fs.readFileSync(controllerFile, 'utf8');
      Object.entries(methods || {}).forEach(([method, config]) => {
        if (!HTTP_METHODS.has(method.toLowerCase())) return;
        if (!config || typeof config !== 'object') return;

        const operationId = config.operationId;
        if (!operationId) {
          errors.push(`${fileName}: missing operationId for ${method.toUpperCase()} ${routePath}`);
          return;
        }

        FRAMEWORKS.forEach((framework) => {
          const handlerFile = path.join(
            root,
            'src',
            'modules',
            moduleName,
            'interface',
            'api',
            'frameworks',
            framework,
            'handlers',
            `${operationId}.ts`
          );

          if (!fileExists(handlerFile)) {
            errors.push(`${fileName}: missing ${framework} handler for operationId "${operationId}" -> ${handlerFile}`);
            return;
          }

          const handlerSource = fs.readFileSync(handlerFile, 'utf8');
          const controllerMethods = getControllerMethodsUsed(handlerSource);
          controllerMethods.forEach((methodName) => {
            if (!controllerHasMethod(controllerSource, methodName)) {
              errors.push(
                `${fileName}: controller "${controllerName}" does not implement "${methodName}" used by ${framework}/${operationId}`
              );
            }
          });
        });
      });
    });
  });

  if (errors.length > 0) {
    console.error('OpenAPI route resolution failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('OpenAPI route resolution check passed.');
}

validateRouteResolution();
