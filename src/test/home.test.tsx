import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

describe('home page', () => {
  it('renders the almanac for the requested date', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('AI 老黄历').length).toBeGreaterThan(0);
    expect(screen.getByText(/九月廿四/)).toBeInTheDocument();
    expect(screen.getAllByText('宜').length).toBeGreaterThan(0);
    expect(screen.getAllByText('忌').length).toBeGreaterThan(0);
    expect(screen.getByText(/吉语/)).toBeInTheDocument();
    expect(container.querySelector('.hijri-arabic')).toBeNull();
    for (const panel of ['.yi-ji-panel.yi', '.yi-ji-panel.ji']) {
      const words = [...container.querySelectorAll(`${panel} .yi-ji-items span`)];
      expect(words.length).toBeGreaterThanOrEqual(3);
      expect(words.length).toBeLessThanOrEqual(6);
      for (const word of words) {
        expect([...(word.textContent ?? '')]).toHaveLength(2);
      }
    }
  });

  it('moves to the next day', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '后一天' }));
    expect(screen.getByText(/2026\.11\.03/)).toBeInTheDocument();
    expect(screen.getByText(/九月廿五/)).toBeInTheDocument();
    expect(screen.queryByText(/九月廿四/)).toBeNull();
  });

  it('uses the red theme on weekends', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/?date=2026-11-08']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('.app')).toHaveClass('theme-red');
  });
});
