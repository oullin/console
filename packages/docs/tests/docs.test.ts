import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { guideSections } from '@docs-config';

const packagePath = new URL('..', import.meta.url);
const sourcePath = new URL('../src/', import.meta.url);
const examplesPath = new URL('../examples/', import.meta.url);
const vitepressPath = new URL('../src/.vitepress/', import.meta.url);
const blockedTokens = ['TODO', 'lorem', 'fake', 'mocked', 'stubbed'];
const importSpecifierPattern = /\b(?:import|export)\b(?:[\s\S]*?\bfrom\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/gu;

const expectedExports = [
	'text',
	'textarea',
	'number',
	'password',
	'confirm',
	'select',
	'multiselect',
	'suggest',
	'autocomplete',
	'search',
	'multisearch',
	'pause',
	'form',
	'table',
	'dataTable',
	'spin',
	'progress',
	'task',
	'stream',
] as const;

const walk = (directory: string): string[] =>
	readdirSync(directory).flatMap((entry) => {
		const path = join(directory, entry);

		return statSync(path).isDirectory() ? walk(path) : [path];
	});

const markdownFiles = (): string[] => walk(sourcePath.pathname).filter((path) => extname(path) === '.md');
const exampleFiles = (): string[] => walk(examplesPath.pathname).filter((path) => extname(path) === '.ts');

const docsCodeFiles = (): string[] =>
	[...walk(vitepressPath.pathname), ...walk(new URL('../tests/', import.meta.url).pathname)]
		.filter((path) => ['.ts', '.vue'].includes(extname(path)))
		.filter((path) => !path.includes('/.vitepress/cache/') && !path.includes('/.vitepress/dist/'));

describe('docs structure', () => {
	it('has a markdown page for every guide section', () => {
		for (const section of guideSections) {
			const path = join(sourcePath.pathname, `${section.link.replace(/^\//u, '')}.md`);

			expect(existsSync(path), `${section.text} is missing at ${path}`).toBe(true);
		}
	});

	it('documents every key public helper', () => {
		const content = markdownFiles()
			.map((path) => readFileSync(path, 'utf8'))
			.join('\n');

		for (const exportName of expectedExports) {
			expect(content, `${exportName} is not documented`).toContain(`\`${exportName}\``);
		}
	});

	it('keeps docs and examples free of placeholder language', () => {
		const files = [...markdownFiles(), ...exampleFiles()];

		for (const path of files) {
			const content = readFileSync(path, 'utf8');

			for (const token of blockedTokens) {
				expect(content, `${relative(packagePath.pathname, path)} contains ${token}`).not.toContain(token);
			}
		}
	});

	it('keeps guide pages useful without leaving for example source files', () => {
		for (const path of markdownFiles().filter((file) => file.includes('/guide/'))) {
			const content = readFileSync(path, 'utf8');

			expect(content, `${relative(packagePath.pathname, path)} needs inline TypeScript usage`).toContain('```ts');
			expect(content, `${relative(packagePath.pathname, path)} should not send readers to source fixtures`).not.toMatch(/\.\.\/\.\.\/examples\//u);
		}
	});

	it('uses aliases instead of relative imports in docs code', () => {
		for (const path of docsCodeFiles()) {
			const content = readFileSync(path, 'utf8');

			for (const match of content.matchAll(importSpecifierPattern)) {
				const specifier = match[1] ?? match[2] ?? '';

				expect(specifier, `${relative(packagePath.pathname, path)} imports ${specifier}`).not.toMatch(/^\.\.?(?:\/|$)/u);
			}
		}
	});
});
