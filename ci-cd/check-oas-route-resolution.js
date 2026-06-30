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
  if (moduleNameRaw === 'organizations') {
    return {
      moduleName: 'Users',
      controllerName: 'OrganizationController'
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

function resolveSchemaByRef(document, ref) {
  if (!ref || typeof ref !== 'string') return null;
  const prefix = '#/components/schemas/';
  if (!ref.startsWith(prefix)) return null;
  const schemaName = ref.slice(prefix.length);
  const schema = document.components?.schemas?.[schemaName];
  if (!schema) return null;
  return { schemaName, schema };
}

function getOperationRequestSchemaRef(operation) {
  if (!operation?.requestBody?.content || typeof operation.requestBody.content !== 'object') return null;
  const entries = Object.values(operation.requestBody.content);
  for (const content of entries) {
    const ref = content?.schema?.$ref;
    if (ref) return ref;
  }
  return null;
}

function getOperationResponseSchemaRefs(operation) {
  const refs = [];
  const responses = operation?.responses || {};
  Object.entries(responses).forEach(([statusCode, response]) => {
    const content = response?.content;
    if (!content || typeof content !== 'object') return;
    Object.values(content).forEach((contentType) => {
      refs.push({
        statusCode,
        ref: contentType?.schema?.$ref || null
      });
    });
  });
  return refs;
}

function validatePortObjectContracts(fileName, document, routePath, method, operation, errors) {
  const uppercaseMethod = method.toUpperCase();
  const operationLabel = `${uppercaseMethod} ${routePath}`;

  if (operation?.requestBody) {
    const requestRef = getOperationRequestSchemaRef(operation);
    if (!requestRef) {
      errors.push(`${fileName}: ${operationLabel} requestBody must reference a components schema via $ref`);
    } else {
      const resolvedRequest = resolveSchemaByRef(document, requestRef);
      if (!resolvedRequest) {
        errors.push(`${fileName}: ${operationLabel} requestBody schema ref not found: ${requestRef}`);
      } else if (!String(resolvedRequest.schema.description || '').trim()) {
        errors.push(
          `${fileName}: ${operationLabel} requestBody schema "${resolvedRequest.schemaName}" must include description`
        );
      }
    }
  }

  const responseRefs = getOperationResponseSchemaRefs(operation);
  const successResponseRefs = responseRefs.filter(({ statusCode }) => String(statusCode).startsWith('2'));
  if (successResponseRefs.length === 0) {
    errors.push(`${fileName}: ${operationLabel} must define at least one 2xx response content schema`);
    return;
  }

  successResponseRefs.forEach(({ statusCode, ref }) => {
    if (!ref) {
      errors.push(`${fileName}: ${operationLabel} response ${statusCode} must reference a components schema via $ref`);
      return;
    }
    const resolvedResponse = resolveSchemaByRef(document, ref);
    if (!resolvedResponse) {
      errors.push(`${fileName}: ${operationLabel} response ${statusCode} schema ref not found: ${ref}`);
      return;
    }
    if (!String(resolvedResponse.schema.description || '').trim()) {
      errors.push(
        `${fileName}: ${operationLabel} response ${statusCode} schema "${resolvedResponse.schemaName}" must include description`
      );
    }
  });
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
      const controllerCandidates = [
        path.join(
          root,
          'src',
          'modules',
          moduleName,
          'adapters',
          'in',
          'http',
          'controllers',
          `${controllerName}.ts`
        ),
        path.join(
          root,
          'src',
          'modules',
          moduleName,
          'interface',
          'controller',
          `${controllerName}.ts`
        )
      ];
      const controllerFile = controllerCandidates.find((candidate) => fileExists(candidate));

      if (!controllerFile) {
        errors.push(`${fileName}: missing controller file for "${routePath}" -> ${controllerCandidates.join(' or ')}`);
        return;
      }

      const controllerSource = fs.readFileSync(controllerFile, 'utf8');
      Object.entries(methods || {}).forEach(([method, config]) => {
        if (!HTTP_METHODS.has(method.toLowerCase())) return;
        if (!config || typeof config !== 'object') return;

        validatePortObjectContracts(fileName, document, routePath, method, config, errors);

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
            'restapi',
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
