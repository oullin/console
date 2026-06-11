import { describe, expect, it } from 'vitest';
import { parseAnsiText, truncate, visibleWidth, wrap } from '../src/index';

describe('string utilities', () => {
  it('measures visible width without ANSI control sequences', () => {
    expect(visibleWidth('\u001B[31mPrompts\u001B[39m')).toBe(7);
  });

  it('truncates by visible width', () => {
    expect(truncate('Ollin Prompts', 10)).toBe('Ollin P...');
  });

  it('wraps words to the requested width', () => {
    expect(wrap('Ollin Prompts', 7)).toEqual(['Ollin', 'Prompts']);
  });

  it('strips ANSI text', () => {
    expect(parseAnsiText('\u001B[32mDone\u001B[39m')).toBe('Done');
  });
});
