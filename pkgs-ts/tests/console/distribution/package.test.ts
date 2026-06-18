import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const testDirectoryPath = dirname(fileURLToPath(import.meta.url)); // .../tests/console/distribution
const suitePath = dirname(testDirectoryPath); // .../tests/console
const testsPackagePath = dirname(suitePath); // .../tests   (consumer package)
const pkgsTsPath = dirname(testsPackagePath); // .../pkgs-ts
const consolePackagePath = join(pkgsTsPath, 'console'); // .../pkgs-ts/console  (@ollin/console)
const workspacePath = dirname(pkgsTsPath); // .../tui  (pnpm workspace root)
const consumerCachePath = join(workspacePath, 'infra', '.cache', 'vitest', 'tests');

describe('package consumption', () => {
	it('imports the built public entrypoint through ESM package resolution', () => {
		execFileSync('pnpm', ['--filter', '@ollin/console', 'build'], {
			cwd: workspacePath,
			stdio: 'pipe',
		});

		const output = execFileSync(
			process.execPath,
			['--input-type=module', '-e', "const module = await import('@ollin/console'); console.log([typeof module.text, typeof module.table, typeof module.stream].join(','));"],
			{
				cwd: testsPackagePath,
				encoding: 'utf8',
			},
		);

		expect(output.trim()).toBe('function,function,function');
	}, 30_000);

	it('exports the complete runtime helper surface from the root entrypoint', () => {
		execFileSync('pnpm', ['--filter', '@ollin/console', 'build'], {
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
			'fallbackUsing',
			'fallbackWhen',
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
			'validateUsing',
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
					const module = await import('@ollin/console');
					const expected = ${JSON.stringify(expectedExports)};
					const missing = expected.filter((name) => typeof module[name] === 'undefined');
					console.log(JSON.stringify({ missing, count: Object.keys(module).length }));
				`,
			],
			{
				cwd: testsPackagePath,
				encoding: 'utf8',
			},
		);

		expect(JSON.parse(output) as { missing: string[] }).toEqual({ missing: [], count: expectedExports.length });
	}, 30_000);

	it('exports public helper types from the built root entrypoint', () => {
		execFileSync('pnpm', ['--filter', '@ollin/console', 'build'], {
			cwd: workspacePath,
			stdio: 'pipe',
		});

		const typecheckCachePath = join(consumerCachePath, 'types');

		mkdirSync(typecheckCachePath, { recursive: true });

		const consumerDirectory = mkdtempSync(join(typecheckCachePath, 'consumer-'));
		const packageScopeDirectory = join(consumerDirectory, 'node_modules', '@ollin');
		const consumerPath = join(consumerDirectory, 'consumer.ts');

		try {
			mkdirSync(packageScopeDirectory, { recursive: true });
			symlinkSync(consolePackagePath, join(packageScopeDirectory, 'console'), 'dir');
			writeFileSync(
				consumerPath,
				`
				import type {
					ChoiceOptions,
					ConfirmPromptOptions,
					FormResponses,
					FormStep,
					FormStepCondition,
					KeyboardEventLike,
					KeyName,
					KeyValue,
					NoteType,
					PromptCancelHandler,
					NotificationPlatform,
					SelectPromptOptions,
					SuggestOptions,
					TaskDefinition,
					TerminalSize,
					TypedValueOptions,
					TypedValueReadResult,
					TypedValueState
				} from '@ollin/console';

				const choices: ChoiceOptions<string> = ['one', { label: 'Two', value: 'two' }];
				const confirmOptions: ConfirmPromptOptions = { message: 'Continue?', default: true };
				const selectOptions: SelectPromptOptions<string> = { message: 'Pick', options: choices };
				const suggestOptions: SuggestOptions = { message: 'Suggest', options: ['one'] };
				const formResponses: FormResponses = [] as unknown as FormResponses;
				const formStep: FormStep = { condition: true, ignoreWhenReverting: false, run: () => null };
				const formStepCondition: FormStepCondition = async () => true;
				const event: KeyboardEventLike = { name: 'return' };
				const keyName: KeyName = '\\n';
				const keyValue: KeyValue = keyName;
				const noteType: NoteType = 'info';
				const notificationPlatform: NotificationPlatform = 'linux';
				const cancel: PromptCancelHandler = () => null;
				const taskDefinition: TaskDefinition<string> = { title: 'Build', task: () => 'done' };
				const terminalSize: TerminalSize = { columns: 80, rows: 24 };
				const typedOptions: TypedValueOptions = { default: 'value' };
				const typedState: TypedValueState = { cursor: 0, value: '' };
				const typedResult: TypedValueReadResult = { cancelled: false, value: 'value' };

				void [
					confirmOptions,
					selectOptions,
					suggestOptions,
					formResponses,
					formStep,
					formStepCondition,
					event,
					keyValue,
					noteType,
					notificationPlatform,
					cancel,
					taskDefinition,
					terminalSize,
					typedOptions,
					typedState,
					typedResult
				];
			`,
			);

			try {
				execFileSync('pnpm', ['exec', 'tsc', '--ignoreConfig', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--strict', '--noEmit', consumerPath], {
					cwd: testsPackagePath,
					stdio: 'pipe',
				});
			} catch (error) {
				const result = error as { stderr?: Buffer | string; stdout?: Buffer | string };
				const stderr = result.stderr?.toString() ?? '';
				const stdout = result.stdout?.toString() ?? '';

				throw new Error([stdout, stderr].filter(Boolean).join('\n'));
			}
		} finally {
			rmSync(consumerDirectory, { force: true, recursive: true });
		}
	}, 30_000);
});
