import type { FormResponses } from '#tui/form/types';

class FormResponseList extends Array<unknown> implements FormResponses {
	[name: string]: unknown;
}

export const createFormResponses = (): FormResponses => new FormResponseList();
