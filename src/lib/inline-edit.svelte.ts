import type { Attachment } from 'svelte/attachments';

export type InlineEdit = Attachment<HTMLElement> & {
	enabled: boolean;
};

export function createInlineEdit({
	on = 'click',
	defaultEnabled = false
}: { on?: 'click' | 'dblclick'; defaultEnabled?: boolean } = {}): InlineEdit {
	let enabled = $state.raw(defaultEnabled);

	function handleEnable(): void {
		enabled = true;
	}

	function handleKeyUp(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			e.preventDefault();
			enabled = false;
		}
	}

	const attachment: Attachment<HTMLElement> = (element) => {
		if (enabled) {
			element.focus();
			element.addEventListener('keyup', handleKeyUp);

			return () => {
				element.removeEventListener('keyup', handleKeyUp);
			};
		}

		element.addEventListener(on, handleEnable);
		return () => {
			element.removeEventListener(on, handleEnable);
		};
	};

	return Object.defineProperties(attachment, {
		enabled: {
			get(): boolean {
				return enabled;
			},
			set(value: boolean) {
				enabled = value;
			},
			enumerable: true
		}
	}) as InlineEdit;
}
