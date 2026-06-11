import { z } from 'zod';

export type NotificationOptions = {
	body: string;
	icon: string;
	sound: string;
	subtitle: string;
	title: string;
};

const notificationOptionsSchema = z.object({
	body: z.string().default(''),
	icon: z.string().default(''),
	sound: z.string().default(''),
	subtitle: z.string().default(''),
	title: z.string(),
});

export const parseNotificationOptions = (options: unknown): NotificationOptions => {
	return notificationOptionsSchema.parse(options);
};
