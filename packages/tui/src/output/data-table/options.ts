import { hasPromptDefault } from '#tui/validators/default';
import type { DataTablePromptOptions } from '#tui/types';

export type NormalizedDataTablePromptOptions<T> = DataTablePromptOptions<T> & {
	hasDefault: boolean;
};

export const normalizeDataTablePromptOptions = <T>(options: DataTablePromptOptions<T>): NormalizedDataTablePromptOptions<T> => ({
	...options,
	hasDefault: hasPromptDefault(options),
});

export const transformDataTableValue = async <T>(options: Pick<DataTablePromptOptions<T>, 'transform'>, value: T | number): Promise<T | number> => {
	return options.transform ? options.transform(value) : value;
};

export const dataTableValidationOptions = async <T>(options: NormalizedDataTablePromptOptions<T>): Promise<DataTablePromptOptions<T>> => ({
	...options,
	default: options.hasDefault ? await transformDataTableValue(options, options.default as T | number) : undefined,
});
