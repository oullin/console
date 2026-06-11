import { promptEnvironment } from '#tui/environment';
import { renderQuestion } from '#tui/theme';
import { visibleLines } from '#tui/typed-value/lines';
import type { TypedValueOptions, TypedValueState } from '#tui/typed-value/types';

export const renderTypedValue = (message: string, state: TypedValueState, options: TypedValueOptions): void => {
	const displayValue = state.value.length > 0 ? visibleLines(state.value, state.cursor, options.rows) : (options.placeholder ?? '');

	promptEnvironment().output.write(`${renderQuestion(message, options.hint)}${displayValue}\n`);
};
