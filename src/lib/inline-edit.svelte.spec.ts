import { describe, expect, it } from 'vitest';
import { createInlineEdit } from './inline-edit.svelte.js';

describe('createInlineEdit', () => {
	it('starts with defaultEnabled = false', () => {
		const edit = createInlineEdit();
		expect(edit.enabled).toBe(false);
	});

	it('respects defaultEnabled option', () => {
		const edit = createInlineEdit({ defaultEnabled: true });
		expect(edit.enabled).toBe(true);
	});

	it('toggles enabled on dblclick', () => {
		const edit = createInlineEdit();

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new MouseEvent('dblclick'));

		expect(edit.enabled).toBe(true);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});

	it('exits enabled on Escape key', () => {
		const edit = createInlineEdit({ defaultEnabled: true });

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

		expect(edit.enabled).toBe(false);

		cleanup?.();
	});

	it('allows manual enabled assignment', () => {
		const edit = createInlineEdit();

		edit.enabled = true;
		expect(edit.enabled).toBe(true);

		edit.enabled = false;
		expect(edit.enabled).toBe(false);
	});
});
