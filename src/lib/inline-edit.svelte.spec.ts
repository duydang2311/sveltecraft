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

	it('exits enabled on Escape key', () => {
		const edit = createInlineEdit({ defaultEnabled: true });

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

		expect(edit.enabled).toBe(false);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});

	it('allows manual enabled assignment', () => {
		const edit = createInlineEdit();

		const el = document.createElement('div');
		const cleanup = edit(el);

		edit.enabled = true;
		expect(edit.enabled).toBe(true);

		edit.enabled = false;
		expect(edit.enabled).toBe(false);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});

	it('defaults to click activation', () => {
		const edit = createInlineEdit();

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new MouseEvent('dblclick'));
		expect(edit.enabled).toBe(false);

		el.dispatchEvent(new MouseEvent('click'));
		expect(edit.enabled).toBe(true);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});

	it('enables on dblclick when on = "dblclick"', () => {
		const edit = createInlineEdit({ on: 'dblclick' });

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new MouseEvent('dblclick'));
		expect(edit.enabled).toBe(true);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});

	it('does not enable on click when on = "dblclick"', () => {
		const edit = createInlineEdit({ on: 'dblclick' });

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new MouseEvent('click'));
		expect(edit.enabled).toBe(false);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});

	it('does not enable on dblclick when on = "click"', () => {
		const edit = createInlineEdit({ on: 'click' });

		const el = document.createElement('div');
		const cleanup = edit(el);

		el.dispatchEvent(new MouseEvent('dblclick'));
		expect(edit.enabled).toBe(false);

		expect.assert(typeof cleanup === 'function');
		cleanup();
	});
});
