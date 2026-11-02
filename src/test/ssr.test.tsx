import { describe, expect, it } from 'vitest';
import { render } from '../entry-server';

describe('server rendering', () => {
  it('renders the home almanac', () => {
    const html = render('/');

    expect(html).toContain('class="home"');
    expect(html).toContain('宜');
    expect(html).toContain('忌');
  });

  it('renders the query page', () => {
    const html = render('/query');

    expect(html).toContain('模型查询');
    expect(html).toContain('分项吉凶');
    expect(html).toContain('备用模型');
  });

  it('renders the pick page', () => {
    const html = render('/pick');

    expect(html).toContain('想做的事');
    expect(html).toContain('十二时辰');
    expect(html).toContain('择日');
  });
});
