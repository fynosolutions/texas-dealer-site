import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/astro/astro.js', 'build'], {
  stdio:'inherit', env:{...process.env, ASTRO_TELEMETRY_DISABLED:'1'}
});
process.exit(result.status ?? 1);
