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

function validateEnvelope(envelope) {
  if (!isPlainObject(envelope)) {
    fail('Input must be a JSON object.');
  }

  const { endpoint, request_id, payload } = envelope;

  if (!endpoint || typeof endpoint !== 'string') {
    fail('endpoint is required and must be a string.');
  }
  if (!endpoint.startsWith('/v1/')) {
    fail('endpoint must start with /v1/.');
  }
  if (!request_id || typeof request_id !== 'string') {
    fail('request_id is required and must be a string.');
  }
  if (!isPlainObject(payload)) {
    fail('payload is required and must be an object.');
  }

  return envelope;
}

function buildRequest(envelope, baseUrl) {
  const url = `${baseUrl.replace(/\/$/, '')}${envelope.endpoint}`;
  const headers = {
    Authorization: `Bearer ${process.env.ACTION_BEARER_TOKEN || ''}`,
    'Content-Type': 'application/json'
  };
  const body = {
    request_id: envelope.request_id,
    idempotency_key: envelope.idempotency_key,
    actor: envelope.actor,
    payload: envelope.payload
  };

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

  const envelope = validateEnvelope(parseJson(input));

  const baseUrl = process.env.ACTION_BASE_URL;
  if (!baseUrl) {
    fail('ACTION_BASE_URL is required.');
  }

  const { url, headers, body } = buildRequest(envelope, baseUrl);

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