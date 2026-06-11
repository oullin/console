import { promptEnvironment } from '#tui/environment';
import { renderInteractiveChoices } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const renderSuggestions = (message: string, value: string, matches: string[], highlighted: number | null, scroll?: number, info?: SuggestOptions['info']): void => {
	renderInteractiveChoices(
		value.length > 0 ? `${message} ${value}` : message,
		matches.map((match) => ({ label: match, value: match })),
		highlighted ?? 0,
		new Set(),
		scroll,
	);

	const text = resolveInfo(info, highlighted === null ? null : (matches[highlighted] ?? null));

	if (text.length > 0) {
		promptEnvironment().output.write(`${text}\n`);
	}
};
