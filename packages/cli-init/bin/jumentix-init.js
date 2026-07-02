#!/usr/bin/env node
/* eslint-disable no-console */
const { run } = require('../src/bootstrap');

run().catch((error) => {
  console.error(`\nBootstrap failed: ${error.message}`);
  process.exit(1);
});

