import { eraseRenderedFrame } from '#tui/status/frame';
import { renderMultipleChoices } from '#tui/prompts/select/render';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export type MultipleChoicesSessionFrame = {
	render(selected: number, marked: Set<number>): void;
	value(): string;
};

export const createMultipleChoicesSessionFrame = <T>(message: string, choices: Array<Choice<T>>, scroll?: number, info?: MultiSelectPromptOptions<T>['info']): MultipleChoicesSessionFrame => {
	let frame = '';

	return {
		render(selected, marked) {
			if (frame.length > 0) {
				eraseRenderedFrame(frame);
			}

			frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);
		},
		value() {
			return frame;
		},
	};
};
