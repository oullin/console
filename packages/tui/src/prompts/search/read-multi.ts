import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { moveSearchHighlight, searchNavigationAction } from '#tui/prompts/search/keys';
import { renderCancelledSearch, renderSearchChoices } from '#tui/prompts/search/render';
import { lineMultiSearchValues, selectedSearchValues, toggleHighlightedSearchChoice } from '#tui/prompts/search/read-multi/result';
import type { MultiSearchChoicesReadResult } from '#tui/prompts/search/read-multi/result';
import { createInitialSearchSelection, displayedSearchChoices, markedSearchChoiceIndexes, toggleSearchChoices } from '#tui/prompts/search/selection';
import type { MultiSearchPromptOptions } from '#tui/types';

export const readMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>): Promise<MultiSearchChoicesReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return { cancelled: false, submitted: false, submittedLabels: [], value: await lineMultiSearchValues(options) };
	}

	let state = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, state.value);

	let highlighted: number | null = null;

	const selected = createInitialSearchSelection(choices, options.default);
	const displayedChoices = () => displayedSearchChoices(choices, selected, state.value);

	let frame = '';

	const render = (): void => {
		const currentChoices = displayedChoices();
		const marked = markedSearchChoiceIndexes(currentChoices, selected);

		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		frame = renderSearchChoices(options.message, state.value, state.cursor, currentChoices, highlighted, marked, [...selected.values()], options.scroll, options.info, true, options.placeholder);
	};

	render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null || key === Key.enter) {
			return { cancelled: false, frame, submitted: true, submittedLabels: [...selected.values()], value: selectedSearchValues(selected) };
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(frame);
			renderCancelledSearch(options.message, state.value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabels: [...selected.values()], value: await cancelPrompt(selectedSearchValues(selected)) };
		}

		const action = searchNavigationAction(key);

		if (action !== null && (action !== 'first' || highlighted !== null) && (action !== 'last' || highlighted !== null)) {
			choices = await resolveSearchChoices(options.options, state.value);

			const currentChoices = displayedChoices();

			highlighted = moveSearchHighlight(currentChoices, highlighted, action, { scroll: options.scroll });
			render();
			continue;
		}

		if (key === Key.ctrlE && highlighted !== null) {
			continue;
		}

		if (key === Key.ctrlA && highlighted !== null) {
			toggleSearchChoices(selected, displayedChoices());

			render();
			continue;
		}

		if (key === Key.space && highlighted !== null) {
			toggleHighlightedSearchChoice(selected, displayedChoices(), highlighted);

			render();
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			eraseRenderedFrame(frame);
			renderCancelledSearch(options.message, state.value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabels: [], value: await cancelPrompt(options.default ?? []) };
		}

		state = { cursor: next.cursor, value: next.value };

		choices = await resolveSearchChoices(options.options, state.value);

		highlighted = null;
		render();
	}
};
