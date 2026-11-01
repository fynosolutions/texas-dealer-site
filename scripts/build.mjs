import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as OpenCC from 'opencc-js';
const result = spawnSync(process.execPath, ['node_modules/astro/astro.js', 'build'], {
  stdio:'inherit', env:{...process.env, ASTRO_TELEMETRY_DISABLED:'1'}
});
if (result.status !== 0) process.exit(result.status ?? 1);
// Simplified Chinese pages are built from the Traditional text, then converted here,
// so there is only one Chinese copy to maintain. Text inside <span data-keep> is left as is.
const toSimplified = OpenCC.Converter({ from: 't', to: 'cn' });
const dir = 'dist/zh-Hans';
for (const entry of readdirSync(dir, { recursive: true })) {
  if (!entry.endsWith('.html')) continue;
  const file = join(dir, entry);
  const html = readFileSync(file, 'utf8');
  writeFileSync(file, html.split(/(<span data-keep[^>]*>[^<]*<\/span>)/).map((part, i) => i % 2 ? part : toSimplified(part)).join(''));
}
