import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { streamFadeStyles } from '#tui/status/stream/fade';
import { renderStreamFrame } from '#tui/status/stream/render';
import type { StreamFadeStyle } from '#tui/status/stream/fade';

type StreamRenderOptions = {
	fading: string[];
	value: string;
};

export class StreamRenderer {
	readonly #fadeStyles: StreamFadeStyle[];
	#frame = '';

	constructor(fadeStyles = streamFadeStyles()) {
		this.#fadeStyles = fadeStyles;
	}

	current(): string {
		return this.#frame;
	}

	render(options: StreamRenderOptions): void {
		if (this.#frame.length > 0) {
			eraseRenderedFrame(this.#frame);
		}

		this.#frame = renderStreamFrame({
			fading: options.fading,
			fadeStyles: this.#fadeStyles,
			value: options.value,
		});

		promptEnvironment().output.write(this.#frame);
	}
}
