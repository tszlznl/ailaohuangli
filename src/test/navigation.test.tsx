import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';

afterEach(() => {
  vi.useRealTimers();
});

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

describe('navigation and theme', () => {
  it('preserves the date when switching pages', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/?date=2026-11-02']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: '查询' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/query?date=2026-11-02');
  });

  it('preserves the model when changing date', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02&model=gpt-6-luna']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '后一天' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/query?date=2026-11-03&model=gpt-6-luna');
  });

  it('preserves the activity when changing date', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=refactor']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '后一天' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/pick?date=2026-11-03&activity=refactor');
  });

  it('drops the model when navigating from query to pick', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02&model=gpt-6-luna']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: '择日' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/pick?date=2026-11-02');
    expect(screen.getByTestId('location')).not.toHaveTextContent('model');
  });

  it('drops the activity when navigating from pick to query', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=refactor']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: '查询' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/query?date=2026-11-02');
    expect(screen.getByTestId('location')).not.toHaveTextContent('activity');
  });

  it('falls back to today for invalid dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    render(
      <MemoryRouter initialEntries={['/query?date=bad']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByDisplayValue('2026-11-02')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('uses the red theme for weekend dates', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-08']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('.app')).toHaveClass('theme-red');
  });

  it('disables the previous day and shows the range hint at the lower bound', () => {
    render(
      <MemoryRouter initialEntries={['/?date=1901-01-01']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '前一天' })).toBeDisabled();
    expect(screen.getByText('日期范围为 1901–2099')).toBeInTheDocument();
  });

  it('disables the next day and shows the range hint at the upper bound', () => {
    render(
      <MemoryRouter initialEntries={['/?date=2099-12-31']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '后一天' })).toBeDisabled();
    expect(screen.getByText('日期范围为 1901–2099')).toBeInTheDocument();
  });
});
