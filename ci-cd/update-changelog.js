/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHANGELOG_FILE = 'CHANGELOG.md';
const RECORD_SEPARATOR = '\x1e';
const FIELD_SEPARATOR = '\x1f';
const GIT_BIN_CANDIDATES = ['/usr/bin/git', '/usr/local/bin/git'];
const GIT_BIN = GIT_BIN_CANDIDATES.find((candidate) => fs.existsSync(candidate));

function runGit(args, options = {}) {
  if (!GIT_BIN) {
    throw new Error('Git binary not found in fixed system locations.');
  }
  try {
    return execFileSync(GIT_BIN, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', options.allowFailure ? 'ignore' : 'pipe']
    }).trim();
  } catch (error) {
    if (options.allowFailure) return '';
    throw error;
  }
}

function getRepoRoot() {
  return runGit(['rev-parse', '--show-toplevel']);
}

function getTags() {
  const output = runGit([
    'for-each-ref',
    '--sort=-creatordate',
    '--format=%(refname:short)%09%(creatordate:short)',
    'refs/tags'
  ], { allowFailure: true });

  if (!output) return [];

  return output.split('\n').map((line) => {
    const [name, date] = line.split('\t');
    const commit = runGit(['rev-list', '-n', '1', name]);
    return {
      name,
      date,
      commit
    };
  });
}

function getCommitDate(ref) {
  return runGit(['show', '-s', '--date=short', '--format=%ad', ref], { allowFailure: true });
}

function getCommits(range) {
  const output = runGit([
    'log',
    '--date=short',
    `--pretty=format:%H${FIELD_SEPARATOR}%h${FIELD_SEPARATOR}%ad${FIELD_SEPARATOR}%an${FIELD_SEPARATOR}%s${RECORD_SEPARATOR}`,
    range
  ], { allowFailure: true });

  if (!output) return [];

  return output
    .split(RECORD_SEPARATOR)
    .filter(Boolean)
    .map((record) => {
      const [hash, shortHash, date, author, subject] = record.split(FIELD_SEPARATOR);
      return {
        hash,
        shortHash,
        date,
        author,
        subject
      };
    });
}

function formatCommit(commit) {
  return `- ${commit.date} ${commit.subject} - ${commit.author}`;
}

function formatSection(title, commits) {
  const lines = [`## ${title}`, ''];

  if (commits.length === 0) {
    lines.push('- No changes.');
  } else {
    lines.push(...commits.map(formatCommit));
  }

  lines.push('');
  return lines.join('\n');
}

function generateChangelog() {
  const tags = getTags();
  const lines = [
    '# Changelog',
    '',
    '<!-- This file is generated from Git history. Run `npm run changelog:update` to refresh it. -->',
    ''
  ];

  if (tags.length === 0) {
    lines.push(formatSection('All Changes', getCommits('HEAD')));
    return `${lines.join('\n').trim()}\n`;
  }

  const [latestTag] = tags;
  const unreleasedCommits = getCommits(`${latestTag.name}..HEAD`);
  lines.push(formatSection('Unreleased', unreleasedCommits));

  tags.forEach((tag, index) => {
    const nextTag = tags[index + 1];
    const range = nextTag ? `${nextTag.name}..${tag.name}` : tag.name;
    const tagDate = tag.date || getCommitDate(tag.name);
    lines.push(formatSection(`${tag.name} - ${tagDate}`, getCommits(range)));
  });

  return `${lines.join('\n').trim()}\n`;
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const root = getRepoRoot();
  const changelogPath = path.join(root, CHANGELOG_FILE);
  const generated = generateChangelog();
  const current = fs.existsSync(changelogPath)
    ? fs.readFileSync(changelogPath, 'utf8')
    : '';

  if (checkOnly) {
    if (current !== generated) {
      console.error(`${CHANGELOG_FILE} is out of sync with Git history.`);
      console.error(`Run "npm run changelog:update" and commit the generated changes.`);
      process.exit(1);
    }
    console.log(`${CHANGELOG_FILE} is in sync with Git history.`);
    return;
  }

  fs.writeFileSync(changelogPath, generated);
  console.log(`${CHANGELOG_FILE} updated from Git history.`);
}

main();
