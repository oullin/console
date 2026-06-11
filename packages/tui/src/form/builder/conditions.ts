import type { FormResponses, FormStep } from '#tui/form/types';

export const shouldRunStep = (step: FormStep, responses: FormResponses): boolean => {
	return typeof step.condition === 'function' ? step.condition(responses) : step.condition;
};

export const shouldIgnoreStepWhenReverting = (step: FormStep, responses: FormResponses): boolean => {
	if (!shouldRunStep(step, responses)) {
		return true;
	}

	return step.ignoreWhenReverting;
};
