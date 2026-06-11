import { shouldIgnoreStepWhenReverting, shouldRunStep } from '#tui/form/builder/conditions';
import { FormRevertedError, runWithFormRevert } from '#tui/form/builder/revert';
import type { FormResponses, FormStep } from '#tui/form/types';

export const submitFormSteps = async (steps: FormStep[], responses: FormResponses): Promise<FormResponses> => {
	let index = 0;
	let wasReverted = false;

	while (index < steps.length) {
		const step = steps[index];

		if (step === undefined) {
			break;
		}

		if (wasReverted && index > 0 && shouldIgnoreStepWhenReverting(step, responses)) {
			index -= 1;
			continue;
		}

		wasReverted = false;

		const key = step.name ?? index;

		if (!shouldRunStep(step, responses)) {
			responses[key] = null;
			index += 1;
			continue;
		}

		try {
			responses[key] = await runWithFormRevert(index > 0, () => step.run(responses, responses[key], step.name));
		} catch (error) {
			if (!(error instanceof FormRevertedError)) {
				throw error;
			}

			wasReverted = true;
		}

		index += wasReverted ? -1 : 1;
	}

	return responses;
};
