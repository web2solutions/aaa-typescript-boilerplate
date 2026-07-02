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

function printHelp() {
  console.log(`
JumentiX Bootstrap CLI

Usage:
  jumentix-init [options]

Options:
  --help                         Show this message and exit
  --non-interactive              Disable prompts (requires --service-type and --project-name)
  --service-type=<id>            One of: rest, websocket, grpc, graphql, functions
  --project-name=<name>          Target folder name/path
  --git-branch=<branch>          Branch to clone (default: main)
  --install-deps=<y|n|true|false> Install dependencies after scaffold (default: true)
  --repo=<git-url>               Override template repository URL
`);
}

function parseCliArgs(argv) {
  const args = {
    help: false,
    nonInteractive: false,
    serviceTypeId: '',
    projectName: '',
    gitBranch: '',
    installDeps: undefined,
    repository: ''
  };

  for (const rawArg of argv) {
    if (rawArg === '--help' || rawArg === '-h') {
      args.help = true;
      continue;
    }

    if (rawArg === '--non-interactive') {
      args.nonInteractive = true;
      continue;
    }

    if (rawArg.startsWith('--service-type=')) {
      args.serviceTypeId = rawArg.split('=')[1] || '';
      continue;
    }

    if (rawArg.startsWith('--project-name=')) {
      args.projectName = rawArg.split('=')[1] || '';
      continue;
    }

    if (rawArg.startsWith('--git-branch=')) {
      args.gitBranch = rawArg.split('=')[1] || '';
      continue;
    }

    if (rawArg.startsWith('--install-deps=')) {
      const installDepsRaw = (rawArg.split('=')[1] || '').toLowerCase();
      args.installDeps = installDepsRaw === 'y' || installDepsRaw === 'yes' || installDepsRaw === 'true' || installDepsRaw === '1';
      continue;
    }

    if (rawArg.startsWith('--repo=')) {
      args.repository = rawArg.split('=')[1] || '';
    }
  }

  return args;
}

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

function resolveServiceTypeById(serviceTypeId) {
  const found = SERVICE_TYPES.find((serviceType) => serviceType.id === serviceTypeId);
  if (!found) {
    throw new Error(`Invalid service type "${serviceTypeId}".`);
  }
  return found;
}

function writeBootstrapProfile(targetPath, payload) {
  const configDir = path.join(targetPath, '.aaa');
  fs.mkdirSync(configDir, { recursive: true });
  const outputPath = path.join(configDir, 'service-profile.json');
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function run() {
  const cliArgs = parseCliArgs(process.argv.slice(2));
  if (cliArgs.help) {
    printHelp();
    return;
  }

  if (cliArgs.nonInteractive && (!cliArgs.serviceTypeId || !cliArgs.projectName)) {
    throw new Error('Non-interactive mode requires --service-type and --project-name.');
  }

  const prompt = cliArgs.nonInteractive
    ? { ask: async () => '', close: () => {} }
    : createPrompt();

  try {
    console.log('\nJumentiX Bootstrap CLI');
    const serviceType = cliArgs.serviceTypeId
      ? resolveServiceTypeById(cliArgs.serviceTypeId)
      : await chooseServiceType(prompt.ask);

    const projectName = cliArgs.projectName || await prompt.ask('Project folder name (e.g. my-service): ');
    if (!projectName) throw new Error('Project folder name is required.');
    const targetPath = toAbsolute(projectName);
    ensureTargetFolderIsEmpty(targetPath);

    const gitBranch = cliArgs.gitBranch || (await prompt.ask('Git branch to clone (default: main): ')) || 'main';
    const installDeps = typeof cliArgs.installDeps === 'boolean'
      ? cliArgs.installDeps
      : (((await prompt.ask('Run npm install after scaffold? (Y/n): ')) || 'y').toLowerCase() !== 'n');
    const repository = cliArgs.repository || BOILERPLATE_REPOSITORY;

    console.log('\nCloning boilerplate repository...');
    runCommand('git', ['clone', '--branch', gitBranch, repository, targetPath], process.cwd());

    writeBootstrapProfile(targetPath, {
      generatedAt: new Date().toISOString(),
      template: 'aaa-typescript-boilerplate',
      repository,
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

module.exports = { run };
