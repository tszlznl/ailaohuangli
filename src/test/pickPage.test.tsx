import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

describe('pick day page', () => {
  it('renders 12 hour cells with the 3/4/5 split', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const cells = screen.getAllByTestId('hour-cell');
    expect(cells).toHaveLength(12);
    expect(cells.filter((cell) => cell.getAttribute('data-verdict') === '吉')).toHaveLength(3);
    expect(cells.filter((cell) => cell.getAttribute('data-verdict') === '平')).toHaveLength(4);
    expect(cells.filter((cell) => cell.getAttribute('data-verdict') === '凶')).toHaveLength(5);
    // 「最宜」「大忌」同时出现在概览标题和摘要里，按角色断言标题，
    // 摘要单独限定在 .pick-summary 内，避免命中多个元素。
    expect(screen.getByRole('heading', { name: '最宜' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '大忌' })).toBeInTheDocument();
    const summary = container.querySelector<HTMLElement>('.pick-summary');
    if (!summary) throw new Error('没有找到摘要 .pick-summary');
    expect(within(summary).getByText(/最宜.*大忌/)).toBeInTheDocument();
  });

  it('switches activity', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=release']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const target = screen.getByRole('button', { name: '重构代码' });
    await user.click(target);
    expect(target).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByTestId('hour-cell')).toHaveLength(12);
  });

  it('writes the selected activity to the URL and keeps the date', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '重构代码' }));
    const location = screen.getByTestId('location');
    expect(location).toHaveTextContent('activity=refactor');
    expect(location).toHaveTextContent('date=2026-11-02');
  });

  it('falls back to release for invalid activities', () => {
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=missing']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '发布新版本' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('labels each hour cell for screen readers', () => {
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const first = screen.getAllByTestId('hour-cell')[0];
    expect(first).toHaveAttribute('aria-label');
    expect(first.getAttribute('aria-label')).toContain('时');
  });

  it('marks the result area as a live region', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
