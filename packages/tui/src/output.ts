import { promptEnvironment } from '#tui/environment';
import { clearTerminal, setTerminalTitle } from '#tui/terminal';
import { renderTable } from '#tui/theme';
import type { TableOptions } from '#tui/types';

const stringify = (value: string | number | boolean | null | undefined): string => {
  return value === null || value === undefined ? '' : String(value);
};

export const note = (message: string, title?: string): void => {
  const heading = title ? `${title}\n` : '';

  promptEnvironment().output.write(`${heading}${message}\n`);
};

export const notify = (message: string, title = 'Notification'): void => {
  note(message, title);
};

export const table = (options: TableOptions): void => {
  const headers = options.headers ?? Object.keys(options.rows[0] ?? {});
  const rows = options.rows.map((row) => {
    if (Array.isArray(row)) {
      return row.map(stringify);
    }

    return headers.map((header) => stringify(row[header]));
  });

  promptEnvironment().output.write(`${renderTable(headers, rows)}\n`);
};

export const grid = table;

export const dataTable = table;

export const title = (value: string): void => {
  setTerminalTitle(value);
};

export const clear = (): void => {
  clearTerminal();
};
