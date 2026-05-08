import type { Attachment } from 'svelte/attachments';

export function createIntersectionAttachment(
	trigger: (entry: IntersectionObserverEntry) => boolean,
	options?: IntersectionObserverInit
) {
	const handlers = new WeakMap<
		Element,
		{
			callback: () => void | (() => void);
			cleanup?: () => void;
		}
	>();

	let count = 0;
	let observer: IntersectionObserver | null = null;

	function getObserver() {
		observer ??= new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const handler = handlers.get(entry.target);
				if (!handler) continue;

				if (trigger(entry)) {
					handler.cleanup?.();
					const ret = handler.callback();
					handler.cleanup = typeof ret === 'function' ? ret : undefined;
				} else {
					handler.cleanup?.();
					handler.cleanup = undefined;
				}
			}
		}, options);
		return observer;
	}

	function attach<T extends Element>(node: T, callback: Attachment<T>) {
		handlers.set(node, {
			callback: () => callback(node)
		});
		const obs = getObserver();
		obs.observe(node);
		++count;
		return () => {
			const handler = handlers.get(node);
			handler?.cleanup?.();
			handlers.delete(node);
			obs.unobserve(node);
			if (--count === 0) {
				obs.disconnect();
				observer = null;
			}
		};
	}

	function wrapper<T extends Element>(callback: Attachment<T>): Attachment<T>;
	function wrapper<T extends Element>(node: T, callback: Attachment<T>): () => void;
	function wrapper<T extends Element>(nodeOrCallback: T | Attachment<T>, callback?: Attachment<T>) {
		if (callback) {
			return attach(nodeOrCallback as T, callback);
		}

		return (node: T) => attach(node, nodeOrCallback as Attachment<T>);
	}

	return wrapper;
}

let __enterView: ReturnType<typeof createIntersectionAttachment> | null = null;
export function enterView<T extends Element>(callback: Attachment<T>): Attachment<T>;
export function enterView<T extends Element>(node: T, callback: Attachment<T>): () => void;
export function enterView<T extends Element>(
	nodeOrCallback: T | Attachment<T>,
	callback?: Attachment<T>
) {
	__enterView ??= createIntersectionAttachment((entry) => entry.isIntersecting);
	if (callback) {
		return __enterView(nodeOrCallback as T, callback);
	}
	return (node: T) => __enterView!(node, nodeOrCallback as Attachment<T>);
}

let __leaveView: ReturnType<typeof createIntersectionAttachment> | null = null;
export function leaveView<T extends Element>(callback: Attachment<T>): Attachment<T>;
export function leaveView<T extends Element>(node: T, callback: Attachment<T>): () => void;
export function leaveView<T extends Element>(
	nodeOrCallback: T | Attachment<T>,
	callback?: Attachment<T>
) {
	__leaveView ??= createIntersectionAttachment((entry) => !entry.isIntersecting);
	if (callback) {
		return __leaveView(nodeOrCallback as T, callback);
	}
	return (node: T) => __leaveView!(node, nodeOrCallback as Attachment<T>);
}
