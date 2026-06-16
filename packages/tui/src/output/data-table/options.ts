import { parseDataTableDefault } from '#tui/output/validators/data-table';
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

export const preserveDataTableRetryDefault = <T>(options: NormalizedDataTablePromptOptions<T>, value: T | number): void => {
	options.default = value;
	options.hasDefault = true;
};

export const dataTableValidationOptions = async <T>(options: NormalizedDataTablePromptOptions<T>): Promise<DataTablePromptOptions<T>> => ({
	...options,
	default: options.hasDefault ? await transformDataTableValue(options, parseDataTableDefault<T>(options.default)) : undefined,
});
