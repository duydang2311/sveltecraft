/** @import { Attachment } from 'svelte/attachments' */

/**
 * @typedef {Attachment<HTMLElement> & {
 *   enabled: boolean;
 * }} InlineEdit
 */

/**
 * Create an {@link InlineEdit} that can be attached to a DOM element to enable inline editing behaviour.
 *
 * @param {{ defaultEnabled?: boolean }} [options] Whether editing is enabled by default.
 * @returns {InlineEdit}
 */
export function createInlineEdit({ defaultEnabled = false } = {}) {
	let enabled = $state.raw(defaultEnabled);

	function handleDblClick() {
		enabled = true;
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	function handleKeyUp(e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			enabled = false;
		}
	}

	/** @type {Attachment<HTMLElement>} */
	const attachment = (element) => {
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

	return /** @type InlineEdit */ (
		Object.defineProperties(attachment, {
			enabled: {
				get() {
					return enabled;
				},
				set(value) {
					enabled = value;
				},
				enumerable: true
			}
		})
	);
}
