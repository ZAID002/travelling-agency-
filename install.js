const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure log file path is correct
const logFile = path.join(__dirname, 'logs', 'passenger.log');

function log(msg) {
  console.log(msg);
  try {
    // Append logs to the passenger log file for cPanel viewing
    fs.appendFileSync(logFile, `[AUTOMATED DEPLOY] ${msg}\n`);
  } catch (e) {
    console.error('Logging failed:', e);
  }
}

log('--- STARTING DEPLOYMENT WORKFLOW ---');

try {
  log('Step 1: Running npm install --legacy-peer-deps...');
  const installOutput = execSync('npm install --legacy-peer-deps', { encoding: 'utf8' });
  log('NPM Install Output:\n' + installOutput);
  
  log('Step 2: Running npm run build...');
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  log('NPM Build Output:\n' + buildOutput);
  
  log('--- DEPLOYMENT COMPLETED SUCCESSFULLY ---');
} catch (error) {
  log('CRITICAL ERROR DURING DEPLOYMENT:\n' + error.message);
  if (error.stderr) {
    log('Error details (stderr):\n' + error.stderr);
  }
}
