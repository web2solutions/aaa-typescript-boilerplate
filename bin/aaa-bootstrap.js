#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const BOILERPLATE_REPOSITORY = 'https://github.com/web2solutions/aaa-typescript-boilerplate.git';
const SERVICE_TYPES = [
  {
    id: 'rest',
    label: 'HTTP/REST server (OpenAPI/Swagger + static assets)',
    profile: { interface: 'http-rest', staticAssets: true, functions: false }
  },
  {
    id: 'websocket',
    label: 'WebSocket server (+ static assets)',
    profile: { interface: 'websocket', staticAssets: true, functions: false }
  },
  {
    id: 'grpc',
    label: 'gRPC server (+ static assets)',
    profile: { interface: 'grpc', staticAssets: true, functions: false }
  },
  {
    id: 'graphql',
    label: 'GraphQL server (+ static assets)',
    profile: { interface: 'graphql', staticAssets: true, functions: false }
  },
  {
    id: 'functions',
    label: 'Function services bundle (AWS/Google/Azure/Vercel/Cloudflare)',
    profile: { interface: 'functions', staticAssets: false, functions: true }
  }
];

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question) => new Promise((resolve) => {
    rl.question(question, (answer) => resolve(String(answer || '').trim()));
  });

  return {
    ask,
    close: () => rl.close()
  };
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${String(result.status)}`);
  }
}

function toAbsolute(targetPath) {
  if (path.isAbsolute(targetPath)) return targetPath;
  return path.resolve(process.cwd(), targetPath);
}

function ensureTargetFolderIsEmpty(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const files = fs.readdirSync(targetPath);
  if (files.length > 0) {
    throw new Error(`Target folder "${targetPath}" already exists and is not empty.`);
  }
}

async function chooseServiceType(ask) {
  console.log('\nSelect service type:');
  SERVICE_TYPES.forEach((type, index) => {
    console.log(` ${index + 1}. ${type.label}`);
  });
  const selected = await ask('Type number: ');
  const index = Number(selected) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= SERVICE_TYPES.length) {
    throw new Error('Invalid service type selection.');
  }
  return SERVICE_TYPES[index];
}

function writeBootstrapProfile(targetPath, payload) {
  const configDir = path.join(targetPath, '.aaa');
  fs.mkdirSync(configDir, { recursive: true });
  const outputPath = path.join(configDir, 'service-profile.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function run() {
  const prompt = createPrompt();

  try {
    console.log('\nAAA Boilerplate Bootstrap CLI');
    const serviceType = await chooseServiceType(prompt.ask);
    const projectName = await prompt.ask('Project folder name (e.g. my-service): ');
    if (!projectName) throw new Error('Project folder name is required.');
    const targetPath = toAbsolute(projectName);
    ensureTargetFolderIsEmpty(targetPath);

    const gitBranch = (await prompt.ask('Git branch to clone (default: main): ')) || 'main';
    const installDeps = ((await prompt.ask('Run npm install after scaffold? (Y/n): ')) || 'y').toLowerCase() !== 'n';

    console.log('\nCloning boilerplate repository...');
    runCommand('git', ['clone', '--branch', gitBranch, BOILERPLATE_REPOSITORY, targetPath], process.cwd());

    writeBootstrapProfile(targetPath, {
      generatedAt: new Date().toISOString(),
      template: 'aaa-typescript-boilerplate',
      repository: BOILERPLATE_REPOSITORY,
      branch: gitBranch,
      serviceType: serviceType.id,
      profile: serviceType.profile
    });

    if (installDeps) {
      console.log('\nInstalling dependencies...');
      runCommand('npm', ['install'], targetPath);
    }

    console.log('\nScaffold completed successfully.');
    console.log(`Project path: ${targetPath}`);
    console.log(`Profile: ${path.join(targetPath, '.aaa', 'service-profile.json')}`);
  } finally {
    prompt.close();
  }
}

run().catch((error) => {
  console.error(`\nBootstrap failed: ${error.message}`);
  process.exit(1);
});
