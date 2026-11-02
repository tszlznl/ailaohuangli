import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SITE_URL = 'https://huangli.199107.xyz';

const routes = [
  { file: 'index.html', title: 'AI 老黄历｜每日 AI 宜忌与模型推荐', path: '/' },
  { file: 'query.html', title: 'AI 模型查询｜今日宜忌与分项吉凶', path: '/query' },
  { file: 'pick.html', title: 'AI 择日｜十二时辰吉凶与行动建议', path: '/pick' },
];

function readHtml(file: string): string {
  return readFileSync(resolve(process.cwd(), file), 'utf8');
}

describe('static route metadata', () => {
  for (const route of routes) {
    it(`${route.file} contains static title, description and canonical`, () => {
      const html = readHtml(route.file);

      expect(html).toContain(`<title>${route.title}</title>`);
      expect(html).toContain(`rel="canonical" href="${SITE_URL}${route.path}"`);
      expect(html).toContain(`property="og:url" content="${SITE_URL}${route.path}"`);
      expect(html).toContain('name="description"');
      expect(html).toContain(`property="og:image" content="${SITE_URL}/og.png"`);
      expect(html).toContain('property="og:image:width" content="1200"');
      expect(html).toContain('property="og:image:height" content="630"');
      expect(html).toContain('name="twitter:card" content="summary_large_image"');
      expect(html).toContain(`name="twitter:image" content="${SITE_URL}/og.png"`);
    });
  }

  it('share image is a 1200x630 png', () => {
    const png = readFileSync(resolve(process.cwd(), 'public/og.png'));

    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
