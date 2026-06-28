const fs = require('fs');
const path = require('path');
const http = require('http');

const rootDirectory = __dirname;
const projectRoot = path.resolve(__dirname, '..');
const configDirectory = path.join(projectRoot, 'src', 'config');
const host = process.env.AAA_SERVICE_MANAGEMENT_HOST || '0.0.0.0';
const port = Number(process.env.AAA_SERVICE_MANAGEMENT_PORT || 3200);
const editableRuntimeKeys = [
  'AAA_HTTP_FRAMEWORK',
  'AAA_REALTIME_API',
  'AAA_REALTIME_API_PROTOCOL',
  'AAA_REALTIME_API_DATABASE_DRIVER'
];
const defaultsByRuntimeKey = {
  AAA_HTTP_FRAMEWORK: 'express',
  AAA_REALTIME_API: 'no',
  AAA_REALTIME_API_PROTOCOL: 'websocket',
  AAA_REALTIME_API_DATABASE_DRIVER: 'Mongo'
};
const envFileByRuntime = {
  dev: '.env.dev',
  development: '.env.dev',
  staging: '.env.staging',
  ci: '.env.ci',
  test: '.env.ci'
};

const contentTypeByExtension = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function resolveRequestPath(urlPath) {
  const cleanPath = String(urlPath || '/').split('?')[0];
  const normalized = cleanPath === '/' ? '/index.html' : cleanPath;
  const absoluteFilePath = path.resolve(rootDirectory, `.${normalized}`);
  const normalizedRoot = `${path.resolve(rootDirectory)}${path.sep}`;
  if (absoluteFilePath !== path.resolve(rootDirectory) && !absoluteFilePath.startsWith(normalizedRoot)) return null;
  return absoluteFilePath;
}

function normalizeEnvironment(runtime) {
  const fallback = process.env.NODE_ENV || 'dev';
  const selected = String(runtime || fallback).trim().toLowerCase();
  return envFileByRuntime[selected] ? selected : 'dev';
}

function resolveEnvFilePath(runtime) {
  const normalizedEnvironment = normalizeEnvironment(runtime);
  const envFileName = envFileByRuntime[normalizedEnvironment];
  return {
    environment: normalizedEnvironment,
    filePath: path.join(configDirectory, envFileName),
    fileName: envFileName
  };
}

function parseEnvContent(envContent) {
  const values = {};
  const lines = String(envContent || '').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) return;
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!key) return;
    const value = rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1)
      : rawValue;
    values[key] = value;
  });
  return values;
}

function toEnvFileValue(rawValue) {
  const value = String(rawValue ?? '').trim();
  if (!value) return '';
  if (/[\s#]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function readRuntimeEnv(runtime) {
  const resolved = resolveEnvFilePath(runtime);
  const fileContent = fs.existsSync(resolved.filePath)
    ? fs.readFileSync(resolved.filePath, 'utf8')
    : '';
  const parsed = parseEnvContent(fileContent);
  const runtimeValues = {};
  editableRuntimeKeys.forEach((key) => {
    runtimeValues[key] = parsed[key] || defaultsByRuntimeKey[key] || '';
  });
  return {
    environment: resolved.environment,
    fileName: resolved.fileName,
    values: runtimeValues
  };
}

function updateRuntimeEnv(runtime, values) {
  const resolved = resolveEnvFilePath(runtime);
  const currentContent = fs.existsSync(resolved.filePath)
    ? fs.readFileSync(resolved.filePath, 'utf8')
    : '';
  const lines = String(currentContent).split(/\r?\n/);
  const updates = {};
  editableRuntimeKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      updates[key] = toEnvFileValue(values[key]);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    const keyExpression = new RegExp(`^\\s*#?\\s*${key}=`);
    const lineIndex = lines.findIndex((line) => keyExpression.test(line));
    const nextLine = `${key}=${value}`;
    if (lineIndex >= 0) {
      lines[lineIndex] = nextLine;
    } else {
      lines.push(nextLine);
    }
  });

  const finalContent = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(resolved.filePath, finalContent.endsWith('\n') ? finalContent : `${finalContent}\n`, 'utf8');

  return readRuntimeEnv(resolved.environment);
}

function writeJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function readBody(request, callback) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk;
  });
  request.on('end', () => {
    callback(body);
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${host}:${port}`);
  if (request.method === 'GET' && requestUrl.pathname === '/api/runtime/env') {
    const runtime = requestUrl.searchParams.get('environment');
    const payload = readRuntimeEnv(runtime);
    writeJson(response, 200, payload);
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/runtime/env') {
    readBody(request, (rawBody) => {
      try {
        const parsed = rawBody ? JSON.parse(rawBody) : {};
        const payload = updateRuntimeEnv(parsed.environment, parsed.values || {});
        writeJson(response, 200, payload);
      } catch (error) {
        writeJson(response, 400, {
          error: 'Invalid payload.',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });
    return;
  }

  const filePath = resolveRequestPath(request.url);
  if (!filePath) {
    response.statusCode = 403;
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        response.statusCode = 404;
        response.end('Not Found');
        return;
      }
      response.statusCode = 500;
      response.end('Internal Server Error');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.setHeader('Content-Type', contentTypeByExtension[extension] || 'application/octet-stream');
    response.statusCode = 200;
    response.end(content);
  });
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Service Management listening on http://${host}:${port}`);
});
