/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const { computeAffectedWorkspaces } = require('./check-affected-workspaces');

function runCommand(command, args, cwd = process.cwd()) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${String(result.status)}`);
  }
}

function resolveCiPlan(affected) {
  const commands = [];

  if (affected.docsOnly) {
    commands.push(['npm', ['run', 'lint']]);
    commands.push(['npm', ['run', 'changelog:check']]);
    return commands;
  }

  commands.push(['npm', ['run', 'ci:gate:strict']]);

  for (const app of affected.apps) {
    commands.push(['npm', ['run', 'build', '--prefix', `apps/${app}`]]);
    commands.push(['npm', ['run', 'test', '--prefix', `apps/${app}`]]);
  }

  for (const pkg of affected.packages) {
    commands.push(['npm', ['run', 'build', '--prefix', `packages/${pkg}`]]);
    commands.push(['npm', ['run', 'test', '--prefix', `packages/${pkg}`]]);
  }

  return commands;
}

function run() {
  const files = process.argv.slice(2).map((file) => String(file || '').trim()).filter(Boolean);
  const affected = computeAffectedWorkspaces(files);
  const commands = resolveCiPlan(affected);

  console.log('[ci-monorepo] affected scope');
  console.log(JSON.stringify(affected, null, 2));

  for (const [command, args] of commands) {
    console.log(`\n[ci-monorepo] running: ${command} ${args.join(' ')}`);
    runCommand(command, args);
  }

  console.log('\n[ci-monorepo] completed successfully.');
}

if (require.main === module) {
  run();
}

module.exports = {
  resolveCiPlan
};
