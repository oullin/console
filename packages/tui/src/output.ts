import { spawn } from 'node:child_process';
import { platform } from 'node:process';
import { promptEnvironment } from '#tui/environment';
import { clearTerminal, setTerminalTitle } from '#tui/terminal';
import { renderTable, symbols } from '#tui/theme';
import type { TableOptions } from '#tui/types';

const stringify = (value: string | number | boolean | null | undefined): string => {
  return value === null || value === undefined ? '' : String(value);
};

export type NoteType = 'alert' | 'error' | 'info' | 'intro' | 'outro' | 'warning' | string;

const notePrefix = (type?: NoteType | null): string => {
  switch (type) {
    case 'error':
      return symbols.error;
    case 'warning':
    case 'alert':
      return symbols.warning;
    case 'info':
      return symbols.info;
    case 'intro':
    case 'outro':
      return symbols.success;
    default:
      return symbols.info;
  }
};

export const note = (message: string, type?: NoteType | null): void => {
  const prefix = notePrefix(type);

  promptEnvironment().output.write(`${prefix} ${message}\n`);
};

export const error = (message: string): void => note(message, 'error');

export const warning = (message: string): void => note(message, 'warning');

export const alert = (message: string): void => note(message, 'alert');

export const info = (message: string): void => note(message, 'info');

export const intro = (message: string): void => note(message, 'intro');

export const outro = (message: string): void => note(message, 'outro');

export const notify = (title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
  if (platform === 'darwin') {
    const script = [
      'display notification',
      JSON.stringify(body),
      'with title',
      JSON.stringify(title),
      subtitle ? `subtitle ${JSON.stringify(subtitle)}` : '',
      sound ? `sound name ${JSON.stringify(sound)}` : ''
    ].filter(Boolean).join(' ');

    spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref();

    return;
  }

  if (platform === 'linux') {
    const args = icon ? ['--icon', icon, title, body] : [title, body];

    spawn('notify-send', args, { detached: true, stdio: 'ignore' }).unref();

    return;
  }

  note(body ? `${title}: ${body}` : title, 'info');
};

const normalizeTableOptions = (headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null): Required<TableOptions> => {
  if (!Array.isArray(headersOrOptions) && 'rows' in headersOrOptions) {
    const headers = headersOrOptions.headers ?? Object.keys(headersOrOptions.rows[0] ?? {});

    return { headers, rows: headersOrOptions.rows };
  }

  return {
    headers: headersOrOptions,
    rows: rows ?? []
  };
};

export const table = (headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null): void => {
  const options = normalizeTableOptions(headersOrOptions, rows);
  const normalizedRows = options.rows.map((row) => {
    if (Array.isArray(row)) {
      return row.map(stringify);
    }

    return options.headers.map((header) => stringify(row[header]));
  });

  promptEnvironment().output.write(`${renderTable(options.headers, normalizedRows)}\n`);
};

export const grid = (items: Array<string | number | boolean> = [], maxWidth?: number): void => {
  const width = maxWidth ?? 4;
  const rows: string[][] = [];

  for (let index = 0; index < items.length; index += width) {
    rows.push(items.slice(index, index + width).map(String));
  }

  promptEnvironment().output.write(rows.map((row) => row.join('  ')).join('\n'));
  promptEnvironment().output.write(items.length > 0 ? '\n' : '');
};

export const dataTable = table;

export const datatable = table;

export const title = (value: string): void => {
  setTerminalTitle(value);
};

export const clear = (): void => {
  clearTerminal();
};
