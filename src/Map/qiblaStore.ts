type LngLat = [ number, number ];
type Listener = (position: LngLat) => void;

let currentPosition: LngLat | null = null;
const listeners = new Set<Listener>();

export const setQiblaPosition = (position: LngLat): void => {
	currentPosition = position;
	listeners.forEach((listener): void => listener(position));
};

// Late subscribers immediately receive the last known position so they stay
// in sync regardless of async style/session-token load ordering.
export const subscribeToQibla = (listener: Listener): (() => void) => {
	listeners.add(listener);
	if (currentPosition !== null) listener(currentPosition);

	return (): void => {
		listeners.delete(listener);
	};
};
