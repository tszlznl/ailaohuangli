import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

const SITE_URL = 'https://huangli.417000.xyz';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

function meta(attribute: 'name' | 'property', key: string) {
  return document.head
    .querySelector(`meta[${attribute}="${key}"]`)
    ?.getAttribute('content');
}

function canonical() {
  return document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
}

describe('page SEO metadata', () => {
  it('sets the home title, description and canonical URL', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(document.title).toBe('AI 老黄历｜每日 AI 宜忌与模型推荐');
    });
    expect(meta('name', 'description')).toContain('34 款 AI 模型');
    expect(meta('property', 'og:title')).toBe('AI 老黄历｜每日 AI 宜忌与模型推荐');
    expect(meta('property', 'og:url')).toBe(`${SITE_URL}/`);
    expect(canonical()).toBe(`${SITE_URL}/`);
  });

  it('sets the query title and canonical URL', async () => {
    renderAt('/query?date=2026-11-02');
    await waitFor(() => {
      expect(document.title).toBe('AI 模型查询｜今日宜忌与分项吉凶');
    });
    expect(meta('name', 'description')).toContain('34 款模型');
    expect(canonical()).toBe(`${SITE_URL}/query`);
  });

  it('sets the pick title and canonical URL', async () => {
    renderAt('/pick?date=2026-11-02');
    await waitFor(() => {
      expect(document.title).toBe('AI 择日｜十二时辰吉凶与行动建议');
    });
    expect(meta('name', 'description')).toContain('十二时辰');
    expect(canonical()).toBe(`${SITE_URL}/pick`);
  });
});
