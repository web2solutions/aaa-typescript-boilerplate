const fs = require('fs');
const path = require('path');
const NODE_ENV = process.env.NODE_ENV || 'dev';

const envFilesByEnv = {
  dev: ['src/config/.env.dev', 'src/config/.env.dev.example', 'src/config/.env.ci'],
  ci: ['src/config/.env.ci', 'src/config/.env.dev.example'],
  prod: ['src/config/.env.prod'],
  staging: ['src/config/.env.staging'],
};

const candidateFiles = envFilesByEnv[NODE_ENV] || envFilesByEnv.dev;
const selectedFile = candidateFiles.find((file) => fs.existsSync(path.resolve(file)));

if (selectedFile) {
  const envFile = fs.readFileSync(path.resolve(selectedFile)).toString();
  const envFileLines = envFile.split('\n');

  for (const line of envFileLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const [key, ...valueParts] = trimmedLine.split('=');
    if (!key || valueParts.length === 0) {
      continue;
    }

    const value = valueParts.join('=');
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

if (!process.env.AAA_JWT_TOKEN_SECRET_KEY) {
  process.env.AAA_JWT_TOKEN_SECRET_KEY = 'ci_jwt_secret_key';
}
