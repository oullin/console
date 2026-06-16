import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedTextDefault } from '#tui/prompts/text-default';
import type { TextSuggestionReadResult } from '#tui/prompts/suggest/read-result';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export type TextSuggestionPromptName = 'autocomplete' | 'suggest';

type ReadTextSuggestionValue = (options: SuggestOptions) => Promise<TextSuggestionReadResult>;

type RenderSubmittedTextSuggestion = (message: string, value: string) => void;

export const runTextSuggestionPrompt = async (
	name: TextSuggestionPromptName,
	options: SuggestOptions,
	readValue: ReadTextSuggestionValue,
	renderSubmitted: RenderSubmittedTextSuggestion,
): Promise<string> => {
	const validationOptions: SuggestOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback(name, options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readValue(options);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = answer.rendered && !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmitted(options.message, value);
				}
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
			},
		),
	);
};
