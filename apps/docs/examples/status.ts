import { progress, spin, stream, task } from '@ollin/console';

export async function statusExamples(): Promise<void> {
	await spin('Installing dependencies', async () => 'installed');

	await progress('Processing files', ['one.ts', 'two.ts'], async (file) => String(file).toUpperCase());

	await task('Publishing', async (logger) => {
		logger.info('Uploading assets');
		logger.success('Assets uploaded');

		return 'published';
	});

	await stream(['Preparing release\n', 'Release ready\n']);
}

export function manualProgressExample(): void {
	const bar = progress(3, 'Manual steps');

	bar.start();
	bar.advance();
	bar.advance();
	bar.finish();
}
