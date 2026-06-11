import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { renderSuggestions } from '#tui/prompts/suggest/render';
import { resolveSuggestions } from '#tui/prompts/suggest/resolve';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const readSuggestionValue = async (options: SuggestOptions): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return ask(options.message, options.hint);
	}

	let state = {
		cursor: options.default?.length ?? 0,
		value: options.default ?? '',
	};
	let highlighted: number | null = null;

	let matches: string[] = await resolveSuggestions(options.options, state.value);

	renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		if (key === Key.tab) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? null : ((highlighted ?? -1) + 1) % matches.length;
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.shiftTab) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? null : ((highlighted ?? -1) + 1) % matches.length;
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (key === Key.up || key === Key.upArrow || key === Key.ctrlP) {
			matches = await resolveSuggestions(options.options, state.value);

			highlighted = matches.length === 0 ? null : ((highlighted ?? matches.length) - 1 + matches.length) % matches.length;
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
			highlighted = 0;
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
			highlighted = Math.max(0, matches.length - 1);
			renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null && matches[highlighted] !== undefined) {
				return matches[highlighted];
			}

			return state.value;
		}

		const next = applyTypedKey(state, key);

		if (next.submitted) {
			return state.value;
		}

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return state.value;
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = null;

		matches = await resolveSuggestions(options.options, state.value);

		renderSuggestions(options.message, state.value, matches, highlighted, options.scroll, options.info);
	}
};
