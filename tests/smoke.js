'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function runClient(args, input) {
  const result = spawnSync('node', ['/app/client/src/cli.js', ...args], {
    input,
    encoding: 'utf8',
    env: {
      ...process.env,
      DRY_RUN: '1'
    }
  });

  return result;
}

function assertIncludes(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    fail(`${label} did not include expected value: ${needle}`);
  }
}

function parseJsonOrFail(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    fail(`Expected JSON output, got parse error: ${err.message}`);
  }
}

function main() {
  const mode = process.argv[2];
  if (mode !== 'smoke') {
    fail('Usage: smoke');
  }

  const baseUrl = process.env.ACTION_BASE_URL;
  if (!baseUrl) {
    fail('ACTION_BASE_URL is required for tests.');
  }

  const examplePath = '/app/docs/examples/example_intent.json';
  const exampleJson = fs.readFileSync(examplePath, 'utf8');

  const stdinResult = runClient(['run', '--stdin'], exampleJson);
  if (stdinResult.status !== 0) {
    fail(`stdin mode failed: ${stdinResult.stderr}`);
  }

  const stdinOut = parseJsonOrFail(stdinResult.stdout);
  if (!stdinOut.dry_run) {
    fail('stdin output missing dry_run flag.');
  }

  const expectedUrl = `${baseUrl.replace(/\/$/, '')}/v1/intents`;
  if (stdinOut.url !== expectedUrl) {
    fail(`stdin url mismatch: expected ${expectedUrl}, got ${stdinOut.url}`);
  }

  const fileResult = runClient(['run', '--file', examplePath]);
  if (fileResult.status !== 0) {
    fail(`file mode failed: ${fileResult.stderr}`);
  }

  const fileOut = parseJsonOrFail(fileResult.stdout);
  if (!fileOut.dry_run) {
    fail('file output missing dry_run flag.');
  }
  if (fileOut.url !== expectedUrl) {
    fail(`file url mismatch: expected ${expectedUrl}, got ${fileOut.url}`);
  }

  const badPayload = {
    kind: 'action'
  };

  const badResult = runClient(['run', '--stdin'], JSON.stringify(badPayload));
  if (badResult.status === 0) {
    fail('expected invalid intent packet to fail but got exit 0.');
  }

  console.log('smoke tests passed');
}

main();
