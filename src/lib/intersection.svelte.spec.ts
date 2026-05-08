import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enterView, leaveView } from './intersection.js';

class MockedIntersectionObserver implements IntersectionObserver {
	static instances: MockedIntersectionObserver[] = [];

	readonly root = null;
	readonly rootMargin = '0px';
	readonly scrollMargin = '0px';
	readonly thresholds = [0];
	readonly observed = new Set<Element>();
	readonly observe = vi.fn((target: Element) => {
		this.observed.add(target);
	});
	readonly unobserve = vi.fn((target: Element) => {
		this.observed.delete(target);
	});
	readonly disconnect = vi.fn(() => {
		this.observed.clear();
	});
	readonly takeRecords = vi.fn((): IntersectionObserverEntry[] => []);

	constructor(readonly callback: IntersectionObserverCallback) {
		MockedIntersectionObserver.instances.push(this);
	}
}

beforeEach(() => {
	MockedIntersectionObserver.instances = [];
	vi.stubGlobal('IntersectionObserver', MockedIntersectionObserver);
});

afterEach(() => {
	document.body.replaceChildren();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

function createObserverEntry(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
	return {
		boundingClientRect: DOMRectReadOnly.fromRect(),
		intersectionRatio: isIntersecting ? 1 : 0,
		intersectionRect: DOMRectReadOnly.fromRect(),
		isIntersecting,
		rootBounds: null,
		target,
		time: 0
	};
}

describe('enterView', () => {
	it('triggers when the node enters view and cleans up when it leaves view', () => {
		const node = document.createElement('div');
		const firstCleanup = vi.fn();
		const secondCleanup = vi.fn();
		const callback = vi.fn().mockReturnValueOnce(firstCleanup).mockReturnValueOnce(secondCleanup);

		const cleanup = enterView(node, callback);
		const observer = MockedIntersectionObserver.instances[0];
		const visibleEntry = createObserverEntry(node, true);
		const hiddenEntry = createObserverEntry(node, false);

		observer.callback([visibleEntry], observer);
		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith(node);
		expect(firstCleanup).not.toHaveBeenCalled();

		observer.callback([hiddenEntry], observer);
		expect(firstCleanup).toHaveBeenCalledOnce();

		observer.callback([visibleEntry], observer);
		expect(callback).toHaveBeenCalledTimes(2);
		cleanup();
		expect(secondCleanup).toHaveBeenCalledOnce();
	});

	it('shares one observer and disconnects after the last node is cleaned up', () => {
		const first = document.createElement('div');
		const second = document.createElement('div');

		const cleanupFirst = enterView(first, vi.fn());
		const cleanupSecond = enterView(second, vi.fn());
		const observer = MockedIntersectionObserver.instances[0];

		expect(MockedIntersectionObserver.instances).toHaveLength(1);
		expect(observer.observe).toHaveBeenCalledWith(first);
		expect(observer.observe).toHaveBeenCalledWith(second);
		expect(observer.observed.has(first)).toBe(true);
		expect(observer.observed.has(second)).toBe(true);

		cleanupFirst();
		expect(observer.unobserve).toHaveBeenCalledWith(first);
		expect(observer.disconnect).not.toHaveBeenCalled();
		expect(observer.observed.has(second)).toBe(true);

		cleanupSecond();
		expect(observer.unobserve).toHaveBeenCalledWith(second);
		expect(observer.disconnect).toHaveBeenCalledOnce();
		expect(observer.observed.size).toBe(0);
	});
});

describe('leaveView', () => {
	it('triggers when the node leaves view and cleans up when it enters view again', () => {
		const node = document.createElement('div');
		const firstCleanup = vi.fn();
		const secondCleanup = vi.fn();
		const callback = vi.fn().mockReturnValueOnce(firstCleanup).mockReturnValueOnce(secondCleanup);

		const cleanup = leaveView(node, callback);
		const observer = MockedIntersectionObserver.instances[0];
		const visibleEntry = createObserverEntry(node, true);
		const hiddenEntry = createObserverEntry(node, false);

		observer.callback([hiddenEntry], observer);
		expect(callback).toHaveBeenCalledOnce();
		expect(callback).toHaveBeenCalledWith(node);
		expect(firstCleanup).not.toHaveBeenCalled();

		observer.callback([visibleEntry], observer);
		expect(firstCleanup).toHaveBeenCalledOnce();

		observer.callback([hiddenEntry], observer);
		expect(callback).toHaveBeenCalledTimes(2);
		cleanup();
		expect(secondCleanup).toHaveBeenCalledOnce();
	});

	it('shares one observer and disconnects after the last node is cleaned up', () => {
		const first = document.createElement('div');
		const second = document.createElement('div');

		const cleanupFirst = leaveView(first, vi.fn());
		const cleanupSecond = leaveView(second, vi.fn());
		const observer = MockedIntersectionObserver.instances[0];

		expect(MockedIntersectionObserver.instances).toHaveLength(1);
		expect(observer.observe).toHaveBeenCalledWith(first);
		expect(observer.observe).toHaveBeenCalledWith(second);
		expect(observer.observed.has(first)).toBe(true);
		expect(observer.observed.has(second)).toBe(true);

		cleanupFirst();
		expect(observer.unobserve).toHaveBeenCalledWith(first);
		expect(observer.disconnect).not.toHaveBeenCalled();
		expect(observer.observed.has(second)).toBe(true);

		cleanupSecond();
		expect(observer.unobserve).toHaveBeenCalledWith(second);
		expect(observer.disconnect).toHaveBeenCalledOnce();
		expect(observer.observed.size).toBe(0);
	});
});
