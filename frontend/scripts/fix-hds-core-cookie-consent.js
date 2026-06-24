/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

/**
 * Find the workspace root by walking upward until pnpm-workspace.yaml is found.
 */
function findWorkspaceRoot(startDir) {
  let dir = startDir;

  while (dir !== '/' && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }

    dir = path.dirname(dir);
  }

  return null;
}

/**
 * Find the hds-core package inside pnpm's .pnpm directory.
 */
function findPnpmHdsCore(workspaceRoot) {
  const pnpmDir = path.join(workspaceRoot, 'node_modules', '.pnpm');

  if (!fs.existsSync(pnpmDir)) return null;

  const entries = fs.readdirSync(pnpmDir);
  const match = entries.find((name) => name.startsWith('hds-core@'));

  if (!match) return null;

  const pkgPath = path.join(pnpmDir, match, 'node_modules', 'hds-core');
  return fs.existsSync(pkgPath) ? pkgPath : null;
}

/**
 * Resolve the installed hds-core package from the workspace root, with a
 * pnpm-store fallback for Docker builds.
 */
function findHdsCoreRoot(workspaceRoot) {
  try {
    return path.dirname(require.resolve('hds-core/package.json', { paths: [workspaceRoot] }));
  } catch {
    return findPnpmHdsCore(workspaceRoot);
  }
}

const workspaceRoot = findWorkspaceRoot(process.cwd());

if (!workspaceRoot) {
  console.error('[fix-hds-core-cookie-consent] Failed: workspace root not found.');
  process.exit(1);
}

const hdsCoreRoot = findHdsCoreRoot(workspaceRoot);

if (!hdsCoreRoot) {
  console.error('[fix-hds-core-cookie-consent] Failed: hds-core package not found.');
  process.exit(1);
}

const targetDir = path.join(hdsCoreRoot, 'lib', 'components', 'cookie-consent');
const targetFile = path.join(targetDir, 'cookieConsent.js');
const cssFile = path.join(targetDir, 'cookieConsent.css');

if (!fs.existsSync(targetDir)) {
  console.error('[fix-hds-core-cookie-consent] Failed: cookie-consent directory missing.');
  process.exit(1);
}

if (!fs.existsSync(cssFile)) {
  console.error('[fix-hds-core-cookie-consent] Failed: cookieConsent.css missing.');
  process.exit(1);
}

const cssContent = fs.readFileSync(cssFile, 'utf8');
const shimContent = `'use strict';\n\nconst css = ${JSON.stringify(
  cssContent
)};\n\nmodule.exports = { __esModule: true, default: css };\n`;

if (!fs.existsSync(targetFile) || fs.readFileSync(targetFile, 'utf8') !== shimContent) {
  fs.writeFileSync(targetFile, shimContent, 'utf8');
  console.log('[fix-hds-core-cookie-consent] Shim updated.');
} else {
  console.log('[fix-hds-core-cookie-consent] Shim already up to date.');
}
