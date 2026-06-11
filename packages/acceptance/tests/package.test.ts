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
});
