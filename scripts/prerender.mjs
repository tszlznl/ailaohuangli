import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { render } from '../.prerender/entry-server.js';

const assetsDir = join(process.cwd(), '.cloudflare/output/v0/workers/default/assets');

const routes = [
  { path: '/', file: 'index.html' },
  { path: '/query', file: 'query.html' },
  { path: '/pick', file: 'pick.html' },
];

for (const route of routes) {
  const file = join(assetsDir, route.file);
  const html = await readFile(file, 'utf8');
  const placeholder = '<div id="root"></div>';

  if (!html.includes(placeholder)) {
    throw new Error(`Root placeholder missing in ${route.file}`);
  }

  await writeFile(file, html.replace(placeholder, `<div id="root">${render(route.path)}</div>`));
}

console.log(`Prerendered ${routes.length} routes`);
