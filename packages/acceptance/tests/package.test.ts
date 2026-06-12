import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testPath = dirname(fileURLToPath(import.meta.url));
const acceptancePath = resolve(testPath, '..');
const workspacePath = resolve(acceptancePath, '../..');

describe('package consumption', () => {
	it('imports the built public entrypoint through ESM package resolution', () => {
		execFileSync('pnpm', ['--filter', '@ollin/tui', 'build'], {
			cwd: workspacePath,
			stdio: 'pipe',
		});

		const output = execFileSync(
			process.execPath,
			['--input-type=module', '-e', "const module = await import('@ollin/tui'); console.log([typeof module.text, typeof module.table, typeof module.stream].join(','));"],
			{
				cwd: acceptancePath,
				encoding: 'utf8',
			},
		);

		expect(output.trim()).toBe('function,function,function');
	});

	it('exports the complete runtime helper surface from the root entrypoint', () => {
		execFileSync('pnpm', ['--filter', '@ollin/tui', 'build'], {
			cwd: workspacePath,
			stdio: 'pipe',
		});

		const expectedExports = [
			'FormBuilder',
			'Key',
			'Logger',
			'Progress',
			'PromptValidationError',
			'Stream',
			'alert',
			'applyTypedKey',
			'autocomplete',
			'backgroundColor',
			'cancelUsing',
			'clear',
			'clearTerminal',
			'commandExists',
			'configurePrompts',
			'confirm',
			'createMemoryOutput',
			'createScriptedInput',
			'cursorToStart',
			'dataTable',
			'datatable',
			'eraseLine',
			'erasePreviousLines',
			'error',
			'executeNotificationCommand',
			'foregroundColor',
			'form',
			'grid',
			'hideCursor',
			'info',
			'intro',
			'keyFromEvent',
			'multisearch',
			'multiselect',
			'note',
			'notificationCommand',
			'notificationCommands',
			'notify',
			'notifyForPlatform',
			'number',
			'oneOf',
			'outro',
			'parseAnsiSegments',
			'parseAnsiText',
			'password',
			'pause',
			'progress',
			'promptEnvironment',
			'readTypedValue',
			'renderOpenTuiTextFrame',
			'search',
			'select',
			'setTerminalTitle',
			'showCursor',
			'spin',
			'stream',
			'suggest',
			'supportsTrueColor',
			'table',
			'task',
			'terminalSize',
			'text',
			'textarea',
			'title',
			'truncate',
			'visibleWidth',
			'warning',
			'withPromptEnvironment',
			'wrap',
		];

		const output = execFileSync(
			process.execPath,
			[
				'--input-type=module',
				'-e',
				`
					const module = await import('@ollin/tui');
					const expected = ${JSON.stringify(expectedExports)};
					const missing = expected.filter((name) => typeof module[name] === 'undefined');
					console.log(JSON.stringify({ missing, count: Object.keys(module).length }));
				`,
			],
			{
				cwd: acceptancePath,
				encoding: 'utf8',
			},
		);

		expect(JSON.parse(output) as { missing: string[] }).toEqual({ missing: [], count: expectedExports.length });
	});
});
