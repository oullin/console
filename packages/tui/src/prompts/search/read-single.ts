import { promptEnvironment } from '#tui/environment';
import { readSearchChoiceInteractive } from '#tui/prompts/search/read-single/interactive';
import { lineSearchValue } from '#tui/prompts/search/read-single/result';
import type { SearchChoiceReadResult } from '#tui/prompts/search/read-single/result';
import type { SearchReadOptions } from '#tui/prompts/search/read-single/types';

export const readSearchChoice = async <T>(options: SearchReadOptions<T>, attempt = 0): Promise<SearchChoiceReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return { cancelled: false, submitted: false, submittedLabel: '', value: await lineSearchValue(options) };
	}

	return readSearchChoiceInteractive(environment.input.readKey, options, attempt);
};
