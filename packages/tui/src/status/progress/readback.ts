import type { ProgressController } from '#tui/status/progress/controller';

export const progressCurrent = (controller: ProgressController): number => {
	return controller.state.current();
};

export const progressPercentageValue = (controller: ProgressController): number => {
	return controller.state.percentage();
};

export const progressValue = (): boolean => true;
