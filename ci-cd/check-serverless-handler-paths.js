/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function collectHandlerPaths(serverlessSource) {
  const handlerRegex = /handler:\s*'([^']+)'/g;
  const handlers = [];
  let match = handlerRegex.exec(serverlessSource);
  while (match) {
    handlers.push(match[1]);
    match = handlerRegex.exec(serverlessSource);
  }
  return handlers;
}

function validateServerlessHandlers() {
  const root = process.cwd();
  const serverlessFile = path.join(root, 'serverless.ts');

  if (!fs.existsSync(serverlessFile)) {
    console.error(`Missing serverless file: ${serverlessFile}`);
    process.exit(1);
  }

  const source = fs.readFileSync(serverlessFile, 'utf8');
  const handlers = collectHandlerPaths(source);

  if (handlers.length === 0) {
    console.error('No handlers were found in serverless.ts');
    process.exit(1);
  }

  const missing = handlers
    .map((handlerPath) => `${handlerPath.split('.').slice(0, -1).join('.')}.ts`)
    .filter((resolvedPath) => !fs.existsSync(path.join(root, resolvedPath)));

  if (missing.length > 0) {
    console.error('Serverless handler path validation failed. Missing files:');
    missing.forEach((missingPath) => console.error(`- ${missingPath}`));
    process.exit(1);
  }

  console.log(`Serverless handler path validation passed (${handlers.length} handlers).`);
}

validateServerlessHandlers();
