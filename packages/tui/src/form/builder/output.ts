import type { FormBuilder } from '#tui/form/builder/index';
import type { OutputBuilderMethods } from '#tui/form/builder/output/contracts';

import {
	alertFormStep,
	clearFormStep,
	dataTableFormStep,
	datatableFormStep,
	errorFormStep,
	gridFormStep,
	infoFormStep,
	introFormStep,
	noteFormStep,
	notifyFormStep,
	outroFormStep,
	tableFormStep,
	titleFormStep,
	warningFormStep,
} from '#tui/form/builder/output/index';

export type { OutputBuilderMethods } from '#tui/form/builder/output/contracts';

export const outputBuilderMethods: OutputBuilderMethods & ThisType<FormBuilder> = {
	alert: alertFormStep,
	clear: clearFormStep,
	dataTable: dataTableFormStep,
	datatable: datatableFormStep,
	error: errorFormStep,
	grid: gridFormStep,
	info: infoFormStep,
	intro: introFormStep,
	note: noteFormStep,
	notify: notifyFormStep,
	outro: outroFormStep,
	table: tableFormStep,
	title: titleFormStep,
	warning: warningFormStep,
};
