import type { MaybePromise } from '#tui/types';

export type FormResponses = unknown[] & Record<string, unknown>;

export type FormStepCondition = boolean | ((responses: FormResponses) => MaybePromise<boolean>);

export type FormStep = {
	condition: FormStepCondition;
	ignoreWhenReverting: boolean;
	name?: string;
	run: (responses: FormResponses, previous: unknown, name?: string) => MaybePromise<unknown>;
};
