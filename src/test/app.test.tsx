import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('App', () => {
  it('renders the brand', () => {
    render(<App />);
    expect(screen.getAllByText('AI 老黄历').length).toBeGreaterThan(0);
  });
});
