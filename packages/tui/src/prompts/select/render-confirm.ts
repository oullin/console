import { promptEnvironment } from '#tui/environment';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, green, red, strikethrough } from '#tui/theme/styles';
import type { ConfirmPromptOptions } from '#tui/types';

const confirmLabel = (options: ConfirmPromptOptions, confirmed: boolean): string => {
	return confirmed ? (options.yes ?? 'Yes') : (options.no ?? 'No');
};

const renderConfirmOptions = (options: ConfirmPromptOptions, confirmed: boolean): string => {
	const yes = options.yes ?? 'Yes';
	const no = options.no ?? 'No';

	return confirmed ? `${green('●')} ${yes} ${dim(`/ ○ ${no}`)}` : `${dim(`○ ${yes} /`)} ${green('●')} ${no}`;
};

const renderCancelledConfirmOptions = (options: ConfirmPromptOptions, confirmed: boolean): string => {
	const yes = strikethrough(options.yes ?? 'Yes');
	const no = strikethrough(options.no ?? 'No');

	return confirmed ? dim(`● ${yes} / ○ ${no}`) : dim(`○ ${yes} / ● ${no}`);
};

export const renderActiveConfirm = (options: ConfirmPromptOptions, confirmed: boolean): string => {
	const frame = `${renderBox({ body: renderConfirmOptions(options, confirmed), borderStyle: cyan, info: options.hint, title: cyan(options.message) })}\n`;

	promptEnvironment().output.write(frame);

	return frame;
};

export const renderSubmittedConfirm = (options: ConfirmPromptOptions, confirmed: boolean): void => {
	promptEnvironment().output.write(`${renderBox({ body: confirmLabel(options, confirmed), title: dim(options.message) })}\n`);
};

export const renderCancelledConfirm = (options: ConfirmPromptOptions, confirmed: boolean): void => {
	const environment = promptEnvironment();

	environment.output.write(`${renderBox({ body: renderCancelledConfirmOptions(options, confirmed), borderStyle: red, title: options.message })}\n`);
	environment.error.write(`${red('  ⚠ Cancelled.')}\n`);
};
