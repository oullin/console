import { spawn } from 'node:child_process';
import { platform } from 'node:process';
import { note } from '#tui/output/notes';

export type NotificationCommand = {
	args: string[];
	bin: string;
};

export const notificationCommand = (targetPlatform: NodeJS.Platform, title: string, body = '', subtitle = '', sound = '', icon = ''): NotificationCommand | null => {
	if (targetPlatform === 'darwin') {
		const script = [
			'display notification',
			JSON.stringify(body),
			'with title',
			JSON.stringify(title),
			subtitle ? `subtitle ${JSON.stringify(subtitle)}` : '',
			sound ? `sound name ${JSON.stringify(sound)}` : '',
		]
			.filter(Boolean)
			.join(' ');

		return { args: ['-e', script], bin: 'osascript' };
	}

	if (targetPlatform === 'linux') {
		const args = icon ? ['--icon', icon, title, body] : [title, body];

		return { args, bin: 'notify-send' };
	}

	return null;
};

export const notifyForPlatform = (targetPlatform: NodeJS.Platform, title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
	const command = notificationCommand(targetPlatform, title, body, subtitle, sound, icon);

	if (command) {
		spawn(command.bin, command.args, { detached: true, stdio: 'ignore' }).unref();

		return;
	}

	note(body ? `${title}: ${body}` : title, 'info');
};

export const notify = (title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
	notifyForPlatform(platform, title, body, subtitle, sound, icon);
};
