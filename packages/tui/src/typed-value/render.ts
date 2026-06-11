import { promptEnvironment } from '#tui/environment';
import { renderQuestion } from '#tui/theme';
import { dim } from '#tui/theme/styles';
import { visibleLines } from '#tui/typed-value/lines';
import { renderTextareaFrame } from '#tui/typed-value/textarea-frame';
import type { TypedValueOptions, TypedValueState } from '#tui/typed-value/types';

export const renderTypedValue = (message: string, state: TypedValueState, options: TypedValueOptions): void => {
	if (options.allowNewLine) {
		promptEnvironment().output.write(`${renderTextareaFrame(message, state, options)}\n`);

		if (options.hint) {
			promptEnvironment().output.write(`${dim(options.hint)}\n`);
		}

		return;
	}

	const displayValue = state.value.length > 0 ? visibleLines(state.value, state.cursor, options.rows) : (options.placeholder ?? '');

	promptEnvironment().output.write(`${renderQuestion(message, options.hint)}${displayValue}\n`);
};
