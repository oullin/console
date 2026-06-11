import { spawn } from 'node:child_process';
import { platform } from 'node:process';
import { note } from '#tui/output/notes';

export const notify = (title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
	if (platform === 'darwin') {
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

		spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref();

		return;
	}

	if (platform === 'linux') {
		const args = icon ? ['--icon', icon, title, body] : [title, body];

		spawn('notify-send', args, { detached: true, stdio: 'ignore' }).unref();

		return;
	}

	note(body ? `${title}: ${body}` : title, 'info');
};
