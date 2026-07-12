import maplibregl from 'maplibre-gl';
import type { MapMouseEvent } from 'maplibre-gl';
import { useEffect, useRef } from 'preact/hooks';
import getSessionTokens from './getSessionToken';
import type { SessionTokens } from './getSessionToken';
import getGoogleStyle from './getGoogleStyle';
import getKaabaLayer from './getKaabaLayer';
import { addQiblaLayers, showQibla } from './getQiblaLayers';
import { setQiblaPosition } from './qiblaStore';
import { defaultZoom, kaabaCoordinates, maxZoom } from './constants';
import 'maplibre-gl/dist/maplibre-gl.css';

let mapInstance: maplibregl.Map | null = null;

export function flyToKaaba(): void {
	mapInstance?.flyTo({ center: kaabaCoordinates, zoom: defaultZoom });
}

function Map() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);

	const initializeMap = (
		centerPointOverride?: [ number, number ],
		hasLocation?: boolean
	): void => {
		getSessionTokens().then((sessionTokens: SessionTokens): void => {
			if (mapContainerRef.current === null) return;

			const map = new maplibregl.Map({
				container: mapContainerRef.current,
				style: getGoogleStyle(sessionTokens),
				center: centerPointOverride ?? kaabaCoordinates,
				zoom: defaultZoom,
				minZoom: 2,
				maxZoom,
				attributionControl: { compact: true }
			});

			map.on('style.load', (): void => {
				addQiblaLayers(map);
				map.addLayer(getKaabaLayer());
			});

			map.on('click', (event: MapMouseEvent): void => {
				const position: [ number, number ] = [ event.lngLat.lng, event.lngLat.lat ];
				showQibla(map, position);
				setQiblaPosition(position);
			});

			map.on('load', (): void => {
				if (hasLocation) {
					const position: [ number, number ] = centerPointOverride;
					showQibla(map, position);
					setQiblaPosition(position);
				}
			})

			mapRef.current = map;
			mapInstance = map;
		});
	};

	useEffect((): (() => void) => {
		if (mapRef.current === null) {
			if (navigator?.geolocation?.getCurrentPosition) {
				navigator.geolocation.getCurrentPosition(
					(position: GeolocationPosition): void => {
						initializeMap([ position.coords.longitude, position.coords.latitude ], true);
					},
					(): void => initializeMap()
				);
			} else {
				initializeMap();
			}
		}

		return (): void => {
			mapRef.current?.remove();
			mapRef.current = null;
			mapInstance = null;
		};
	}, []);

	return (
		<div id="map" ref={ mapContainerRef } />
	);
}

export default Map;
