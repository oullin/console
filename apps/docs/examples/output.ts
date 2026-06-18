import { alert, clear, dataTable, error, grid, info, intro, note, outro, table, title, warning } from '@ollin/console';

export function outputExamples(): void {
	intro('Deployment');
	info('Preparing release artefacts.');
	warning('Two optional checks were skipped.');
	error('A required check failed.');
	alert('Manual review required.');
	note('Use output helpers for durable terminal messages.', 'info');

	table(
		['Name', 'Runtime'],
		[
			['Prompts', 'TypeScript'],
			['Renderer', 'OpenTUI'],
		],
	);

	dataTable({
		headers: ['Name', 'Role'],
		rows: [
			['Ada', 'Admin'],
			['Grace', 'Operator'],
		],
	});

	grid(['text', 'select', 'search', 'task']);
	title('Ollin TUI');
	clear();
	outro('Done');
}
