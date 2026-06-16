import { firstEnabledIndex } from '#tui/concerns/choices';
import { eraseRenderedFrame } from '#tui/status/frame';
import { moveSelectHighlight } from '#tui/prompts/select/keys';
import { markedChoiceIndexes, toggleAllEnabledChoices, toggleMarkedChoice } from '#tui/prompts/select/multiple';
import { renderMultipleChoices } from '#tui/prompts/select/render';
import type { SelectNavigationAction } from '#tui/prompts/select/keys';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export type MultipleChoicesReaderSession = {
	frame(): string;
	marked(): Set<number>;
	move(action: SelectNavigationAction): void;
	render(): void;
	selected(): number;
	toggleAll(): void;
	toggleIndex(index: number): boolean;
	toggleSelected(): void;
};

export const createMultipleChoicesReaderSession = <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaults: T[],
	scroll?: number,
	info?: MultiSelectPromptOptions<T>['info'],
): MultipleChoicesReaderSession => {
	let selected = firstEnabledIndex(choices);
	let marked = markedChoiceIndexes(choices, defaults);
	let frame = '';

	function render(): void {
		if (frame.length > 0) {
			eraseRenderedFrame(frame);
		}

		frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);
	}

	return {
		frame() {
			return frame;
		},
		marked() {
			return marked;
		},
		move(action) {
			selected = moveSelectHighlight(choices, selected, action, scroll);
			render();
		},
		render,
		selected() {
			return selected;
		},
		toggleAll() {
			marked = toggleAllEnabledChoices(choices, marked);
			render();
		},
		toggleIndex(index) {
			if (!choices[index] || choices[index]?.disabled) {
				return false;
			}

			marked = toggleMarkedChoice(choices, marked, index);
			render();

			return true;
		},
		toggleSelected() {
			marked = toggleMarkedChoice(choices, marked, selected);
			render();
		},
	};
};
