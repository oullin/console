import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { createPromptSubmissionState } from '#tui/prompt/submission';
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

	const activeFrame = activePromptFrame();
	const submission = createPromptSubmissionState<void>(undefined);

	return promptWithFallback(name, options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				submission.reset();

				const answer = await readValue(options);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				submission.capture(answer.rendered, answer.cancelled, undefined);

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				activeFrame.clear();
				submission.render(() => {
					renderSubmitted(options.message, value);
				});
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
				submission.reset();
			},
		),
	);
};
