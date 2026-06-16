import { promptEnvironment } from '#tui/environment';
import { streamFadeStyles } from '#tui/status/stream/fade';
import { renderStreamFrame } from '#tui/status/stream/render';
import type { StreamFadeStyle } from '#tui/status/stream/fade';

type StreamRenderOptions = {
	fading: string[];
	value: string;
};

export class StreamRenderer {
	readonly #fadeStyles: StreamFadeStyle[];

	constructor(fadeStyles = streamFadeStyles()) {
		this.#fadeStyles = fadeStyles;
	}

	render(options: StreamRenderOptions): void {
		promptEnvironment().output.write(
			renderStreamFrame({
				fading: options.fading,
				fadeStyles: this.#fadeStyles,
				value: options.value,
			}),
		);
	}
}
