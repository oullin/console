import { isFormStepConditionCallback } from '#tui/form/builder/validators/conditions';
import type { FormResponses, FormStep } from '#tui/form/types';

export const shouldRunStep = async (step: FormStep, responses: FormResponses): Promise<boolean> => {
	return isFormStepConditionCallback(step.condition) ? step.condition(responses) : step.condition;
};

export const shouldIgnoreStepWhenReverting = async (step: FormStep, responses: FormResponses): Promise<boolean> => {
	if (!(await shouldRunStep(step, responses))) {
		return true;
	}

	return step.ignoreWhenReverting;
};
