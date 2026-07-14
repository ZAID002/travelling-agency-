const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure log file path is correct
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'passenger.log');

// Make sure the logs folder actually exists before we ever try to write to it
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

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
  // --no-audit --no-fund --prefer-offline cuts down extra network/CPU work.
  // Lowering Node's memory ceiling a bit paradoxically helps npm avoid being
  // OOM-killed on tight shared-hosting memory limits (it garbage-collects sooner).
  const installOutput = execSync(
    'npm install --legacy-peer-deps --no-audit --no-fund --prefer-offline',
    {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 20, // 20MB, in case output is large
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' }
    }
  );
  log('NPM Install Output:\n' + installOutput);

  // Zip extraction on cPanel often strips executable permissions from
  // scripts/symlinks inside node_modules/.bin (e.g. the `next` binary).
  // Fix that here before trying to run the build.
  log('Step 1b: Fixing executable permissions on node_modules/.bin ...');
  try {
    execSync('chmod -R 755 node_modules/.bin', { encoding: 'utf8' });
    log('Permissions fixed successfully.');
  } catch (chmodErr) {
    log('WARNING: chmod step failed (continuing anyway): ' + chmodErr.message);
  }

  log('Step 2: Running npm run build...');
  const buildOutput = execSync('npm run build', {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' }
  });
  log('NPM Build Output:\n' + buildOutput);

  log('--- DEPLOYMENT COMPLETED SUCCESSFULLY ---');
} catch (error) {
  log('CRITICAL ERROR DURING DEPLOYMENT:\n' + (error.message || '(no message)'));
  log('Exit code: ' + error.status + ' | Signal: ' + error.signal);
  if (error.stdout) {
    log('Partial stdout before failure:\n' + error.stdout);
  }
  if (error.stderr) {
    log('Error details (stderr):\n' + error.stderr);
  }
  if (!error.stdout && !error.stderr) {
    log('NOTE: No stdout/stderr captured — process was likely killed (e.g. out-of-memory / SIGKILL) before it could print anything.');
  }
}
