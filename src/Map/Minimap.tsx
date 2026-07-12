import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'preact/hooks';
import getSessionTokens from './getSessionToken';
import type { SessionTokens } from './getSessionToken';
import getMinimapStyle from './getMinimapStyle';
import { addQiblaLayers, showQibla } from './getQiblaLayers';
import { subscribeToQibla } from './qiblaStore';
import { kaabaCoordinates, primaryGreen, white } from './constants';

const mobileQuery = '(max-width: 768px)';

const addMeccaMarker = (map: maplibregl.Map): void => {
	map.addSource('minimap-mecca', {
		type: 'geojson',
		data: {
			type: 'Feature',
			properties: {},
			geometry: { type: 'Point', coordinates: kaabaCoordinates }
		}
	});
	map.addLayer({
		id: 'minimap-mecca-background',
		type: 'circle',
		source: 'minimap-mecca',
		paint: { 'circle-color': white, 'circle-radius': 10 }
	});
	map.addLayer({
		id: 'minimap-mecca-foreground',
		type: 'circle',
		source: 'minimap-mecca',
		paint: { 'circle-color': primaryGreen, 'circle-radius': 8 }
	});
};

const fitToQibla = (map: maplibregl.Map, position: [ number, number ]): void => {
	const [ kaabaLng, kaabaLat ] = kaabaCoordinates;
	const longitudeDelta = kaabaLng - position[0];
	const unwrappedMeccaLng = kaabaLng - 360 * Math.round(longitudeDelta / 360);

	const bounds = new maplibregl.LngLatBounds();
	bounds.extend(position);
	bounds.extend([ unwrappedMeccaLng, kaabaLat ]);

	map.fitBounds(bounds, { padding: 30, maxZoom: 12, animate: false });
};

function Minimap() {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [ isMobile, setIsMobile ] = useState<boolean>(
		(): boolean => window.matchMedia(mobileQuery).matches
	);

	useEffect((): (() => void) => {
		const media = window.matchMedia(mobileQuery);
		const onChange = (): void => setIsMobile(media.matches);

		media.addEventListener('change', onChange);

		return (): void => media.removeEventListener('change', onChange);
	}, []);

	useEffect((): (() => void) | void => {
		if (isMobile || containerRef.current === null) return;

		let styleLoaded = false;
		let pendingPosition: [ number, number ] = kaabaCoordinates;

		getSessionTokens().then((sessionTokens: SessionTokens): void => {
			if (containerRef.current === null) return;

			const map = new maplibregl.Map({
				container: containerRef.current,
				style: getMinimapStyle(sessionTokens),
				center: kaabaCoordinates,
				zoom: 1,
				interactive: false,
				attributionControl: false
			});

			map.on('style.load', (): void => {
				addQiblaLayers(map, false);
				addMeccaMarker(map);

				styleLoaded = true;
				if (pendingPosition !== null) {
					showQibla(map, pendingPosition);
					fitToQibla(map, pendingPosition);
				}
			});

			mapRef.current = map;
		});

		const unsubscribe = subscribeToQibla((position: [ number, number ]): void => {
			const map = mapRef.current;
			if (map === null || !styleLoaded) {
				pendingPosition = position;
				return;
			}

			showQibla(map, position);
			fitToQibla(map, position);
		});

		return (): void => {
			unsubscribe();
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, [ isMobile ]);

	if (isMobile) return null;

	return (
		<div className="qibla__minimap" ref={ containerRef } />
	);
}

export default Minimap;
