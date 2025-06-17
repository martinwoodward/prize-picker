#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

// Update build timestamp
const timestamp = Date.now().toString();
const timestampRegex = /APP_BUILD_TIMESTAMP='[^']*'/;

if (timestampRegex.test(envContent)) {
  // Replace existing timestamp
  envContent = envContent.replace(timestampRegex, `APP_BUILD_TIMESTAMP='${timestamp}'`);
} else {
  // Add timestamp if it doesn't exist
  envContent += `\nAPP_BUILD_TIMESTAMP='${timestamp}'`;
}

// Write back to .env file
fs.writeFileSync(envPath, envContent);

console.log(`Build timestamp updated: ${timestamp}`);
console.log(`Date: ${new Date(parseInt(timestamp, 10)).toISOString()}`);
