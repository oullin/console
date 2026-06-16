import { hasPromptDefault } from '#tui/validators/default';
import type { ConfirmPromptOptions } from '#tui/types';

export type NormalizedConfirmPromptOptions = ConfirmPromptOptions & {
	default: boolean;
	hasDefault: boolean;
};

export const confirmHasDefault = (messageOrOptions: string | ConfirmPromptOptions, argumentCount: number, defaultValue?: boolean): boolean => {
	return typeof messageOrOptions === 'string' ? argumentCount >= 2 && defaultValue !== undefined : hasPromptDefault(messageOrOptions);
};

export const normalizeConfirmPromptOptions = (
	messageOrOptions: string | ConfirmPromptOptions,
	defaultValue: boolean,
	yes: string,
	no: string,
	required: boolean | string,
	validate: ConfirmPromptOptions['validate'],
	hint: string,
	transform: ConfirmPromptOptions['transform'],
	hasDefault: boolean,
): NormalizedConfirmPromptOptions => {
	if (typeof messageOrOptions !== 'string') {
		return {
			...messageOrOptions,
			default: hasDefault ? (messageOrOptions.default as boolean) : true,
			hasDefault,
		};
	}

	return {
		default: hasDefault ? defaultValue : true,
		hasDefault,
		hint,
		label: messageOrOptions,
		message: messageOrOptions,
		no,
		required,
		transform,
		validate,
		yes,
	};
};

export const transformConfirmValue = async (options: Pick<ConfirmPromptOptions, 'transform'>, value: boolean): Promise<boolean> => {
	return options.transform ? options.transform(value) : value;
};

export const transformedConfirmDefault = async (options: NormalizedConfirmPromptOptions): Promise<boolean> => {
	try {
		return await transformConfirmValue(options, options.default);
	} catch {
		return options.default;
	}
};
