import type { Attachment } from 'svelte/attachments';

type InlineEdit = Attachment<HTMLElement> & {
	enabled: boolean;
};

export function createInlineEdit({
	defaultEnabled = false
}: { defaultEnabled?: boolean } = {}): InlineEdit {
	let enabled = $state.raw(defaultEnabled);

	function handleDblClick(): void {
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

		element.addEventListener('dblclick', handleDblClick);

		return () => {
			element.removeEventListener('dblclick', handleDblClick);
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
