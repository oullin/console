import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderCancelledTypedValue } from '#tui/typed-value/render';
import { renderCancelledTextareaFrame } from '#tui/typed-value/textarea-frame';
import type { TypedValueReadResult } from '#tui/typed-value/read';
import type { TypedValueOptions } from '#tui/typed-value/types';

type CancelTypedValueReadOptions = {
	frame: string;
	message: string;
	options: TypedValueOptions;
	value: string;
};

export const cancelTypedValueRead = async ({ frame, message, options, value }: CancelTypedValueReadOptions): Promise<TypedValueReadResult> => {
	eraseRenderedFrame(frame);

	if (!options.allowNewLine) {
		renderCancelledTypedValue(message, value, options);
	} else {
		renderCancelledTextareaFrame(message, value, options);
	}

	return {
		cancelled: true,
		value: await cancelPrompt(value),
	};
};
