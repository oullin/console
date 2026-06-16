import { spawnSync } from 'node:child_process';
import { parseNotificationCommand, parseNotificationCommandBin, parseNotificationCommands } from '#tui/output/notify/validators/command';
import type { NotificationCommand, NotificationPlatform } from '#tui/output/notify/commands';

export type NotificationRuntime = {
	commandExists?: (bin: string) => boolean;
	execute?: (command: NotificationCommand) => boolean;
};

export const commandExists = (bin: string): boolean => {
	const parsedBin = parseNotificationCommandBin(bin);

	if (parsedBin === undefined) {
		return false;
	}

	const result = spawnSync('command', ['-v', parsedBin], { shell: true, stdio: 'ignore' });

	return result.status === 0;
};

export const executeNotificationCommand = (command: NotificationCommand): boolean => {
	const parsedCommand = parseNotificationCommand(command);

	if (parsedCommand === undefined) {
		return false;
	}

	const result = spawnSync(parsedCommand.bin, parsedCommand.args, { stdio: 'ignore' });

	return result.status === 0;
};

export const availableNotificationCommands = (targetPlatform: NotificationPlatform, commands: NotificationCommand[], exists: (bin: string) => boolean = commandExists): NotificationCommand[] => {
	const parsedCommands = parseNotificationCommands(commands);

	if (targetPlatform !== 'linux') {
		return parsedCommands.slice(0, 1);
	}

	return parsedCommands.filter((command) => exists(command.bin));
};
