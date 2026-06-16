import { z } from 'zod';
import type { NotificationCommand } from '#tui/output/notify/commands';

const notificationCommandSchema = z.object({
	args: z.array(z.string()).default([]),
	bin: z.string().min(1),
});

const notificationCommandListSchema = z.array(notificationCommandSchema);

export const parseNotificationCommand = (command: unknown): NotificationCommand | undefined => {
	const parsed = notificationCommandSchema.safeParse(command);

	return parsed.success ? parsed.data : undefined;
};

export const parseNotificationCommands = (commands: unknown): NotificationCommand[] => {
	const parsed = notificationCommandListSchema.safeParse(commands);

	return parsed.success ? parsed.data : [];
};

export const parseNotificationCommandBin = (bin: unknown): string | undefined => {
	const parsed = notificationCommandSchema.shape.bin.safeParse(bin);

	return parsed.success ? parsed.data : undefined;
};
