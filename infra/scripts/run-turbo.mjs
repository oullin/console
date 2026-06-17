// Single entry point for workspace turbo tasks.
//
// Turbo writes its content cache wherever `--cache-dir` points (we send it to
// infra/.cache/turbo), but it ALSO drops a per-package `.turbo/turbo-<task>.log`
// into every workspace dir and offers no flag to relocate those. This runner
// centralizes the cache env/flags in one place and deletes the stray `.turbo`
// dirs after the run so `infra/.cache` stays the only cache root on disk.
//
// Usage: node infra/scripts/run-turbo.mjs <task> [outputLogs]
//   <task>       turbo task to run (build | test | typecheck)
//   [outputLogs] value for --output-logs (default: none)

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const infraRoot = resolve(scriptDir, '..');
const repoRoot = resolve(infraRoot, '..');
const cacheRoot = resolve(infraRoot, '.cache');

const turboCache = join(cacheRoot, 'turbo');
const task = process.argv[2];
const outputLogs = process.argv[3] ?? 'none';

if (!task) {
	console.error('run-turbo: missing task name (build | test | typecheck)');
	process.exit(2);
}

// Skip node_modules/.git when hunting for stray .turbo dirs; never matches the
// real cache bucket, which is named `turbo` (no dot) under infra/.cache.
const PRUNE = new Set(['node_modules', '.git']);

function removeStrayTurboDirs(dir) {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}
		if (entry.name === '.turbo') {
			rmSync(join(dir, entry.name), { recursive: true, force: true });
			continue;
		}
		if (PRUNE.has(entry.name)) {
			continue;
		}
		removeStrayTurboDirs(join(dir, entry.name));
	}
}

mkdirSync(join(turboCache, 'logs'), { recursive: true });

const turboBin = join(repoRoot, 'node_modules', '.bin', 'turbo');
const command = existsSync(turboBin) ? turboBin : 'turbo';

let exitCode = 1;
try {
	const result = spawnSync(
		command,
		[
			'run',
			task,
			'--cache-dir',
			turboCache,
			'--log-file',
			join(turboCache, 'logs', `${task}.json`),
			`--output-logs=${outputLogs}`,
		],
		{
			cwd: repoRoot,
			stdio: 'inherit',
			env: {
				...process.env,
				XDG_CACHE_HOME: join(cacheRoot, 'xdg'),
				PLAYWRIGHT_BROWSERS_PATH: join(cacheRoot, 'playwright'),
			},
		},
	);
	exitCode = result.status ?? 1;
} finally {
	removeStrayTurboDirs(repoRoot);
}

process.exit(exitCode);
