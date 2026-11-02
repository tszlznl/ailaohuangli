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

describe('query page', () => {
  it('renders the default model reading', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('查询模型')).toHaveValue('claude-sonnet-5-5');
    expect(screen.getByRole('heading', { name: 'Claude Sonnet 5.5' })).toBeInTheDocument();
    // 分项标签同时也出现在备用模型的理由里（如「宜 · 写代码」），
    // 因此断言必须限定在分项格内，否则分项行缺失也会被备用卡片掩盖。
    const grid = container.querySelector<HTMLElement>('.category-grid');
    if (!grid) throw new Error('没有找到分项格 .category-grid');
    expect(within(grid).getByText('写代码')).toBeInTheDocument();
    expect(within(grid).getByText('写文章')).toBeInTheDocument();
    expect(within(grid).getByText('翻译')).toBeInTheDocument();
    expect(within(grid).getByText('查资料')).toBeInTheDocument();
  });

  it('updates the reading when the model changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('查询模型'), 'gpt-6-luna');
    expect(screen.getByRole('heading', { name: 'GPT-6 Luna' })).toBeInTheDocument();
  });

  it('falls back to the default model for invalid ids', () => {
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02&model=missing']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('查询模型')).toHaveValue('claude-sonnet-5-5');
  });

  it('marks the result region as a live region', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('notes that a preview model may change status', () => {
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02&model=mistral-large-4']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText('预览模型状态可能变化')).toBeInTheDocument();
  });

  it('omits the preview note for a stable model', () => {
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.queryByText('预览模型状态可能变化')).toBeNull();
  });

  it('writes the selected model to the URL and keeps the date', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('查询模型'), 'gpt-6-luna');
    const location = screen.getByTestId('location');
    expect(location).toHaveTextContent('model=gpt-6-luna');
    expect(location).toHaveTextContent('date=2026-11-02');
  });
});
