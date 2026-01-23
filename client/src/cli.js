#!/usr/bin/env node
'use strict';

const fs = require('fs');

function printUsage() {
  const msg = [
    'Usage:',
    '  action-client run --stdin',
    '  action-client run --file <path>'
  ].join('\n');
  console.error(msg);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function parseJson(input) {
  try {
    return JSON.parse(input);
  } catch (err) {
    fail(`Invalid JSON input: ${err.message}`);
  }
}

function validateIntentPacket(packet) {
  if (!isPlainObject(packet)) {
    fail('Input must be a JSON object.');
  }

  if (packet.kind !== 'intent') {
    fail('kind is required and must be "intent".');
  }

  return packet;
}

function buildRequest(packet, baseUrl) {
  const url = `${baseUrl.replace(/\/$/, '')}/v1/intents`;
  const headers = {
    Authorization: `Bearer ${process.env.ACTION_BEARER_TOKEN || ''}`,
    'Content-Type': 'application/json'
  };
  const body = packet;

  return { url, headers, body };
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args[0] !== 'run') {
    printUsage();
    process.exit(1);
  }

  const mode = args[1];
  let input;

  if (mode === '--stdin') {
    input = await readStdin();
  } else if (mode === '--file') {
    const filePath = args[2];
    if (!filePath) {
      printUsage();
      process.exit(1);
    }
    try {
      input = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      fail(`Unable to read file: ${err.message}`);
    }
  } else {
    printUsage();
    process.exit(1);
  }

  const packet = validateIntentPacket(parseJson(input));

  const baseUrl = process.env.ACTION_BASE_URL;
  if (!baseUrl) {
    fail('ACTION_BASE_URL is required.');
  }

  const { url, headers, body } = buildRequest(packet, baseUrl);

  if (process.env.DRY_RUN === '1') {
    const redactedHeaders = { ...headers, Authorization: 'Bearer [REDACTED]' };
    const output = {
      dry_run: true,
      url,
      headers: redactedHeaders,
      body
    };
    process.stdout.write(JSON.stringify(output, null, 2));
    process.exit(0);
  }

  const timeoutSeconds = Number(process.env.ACTION_TIMEOUT_SECONDS || '20');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const text = await response.text();
    if (response.ok) {
      process.stdout.write(text);
      process.exit(0);
    }

    console.error(`HTTP ${response.status} ${response.statusText}`);
    if (text) {
      console.error(text);
    }
    process.exit(1);
  } catch (err) {
    const message = err.name === 'AbortError'
      ? `Request timed out after ${timeoutSeconds}s.`
      : `Request failed: ${err.message}`;
    console.error(message);
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

run().catch(err => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
