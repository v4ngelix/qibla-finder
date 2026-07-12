import type { GeoJSONSource, Map } from 'maplibre-gl';
import getGreatCirclePoints from './greatCircle';
import getQiblaLabel from './getQiblaLabel';
import { kaabaCoordinates, primaryGreen, white } from './constants';

const qiblaLineSource = 'qibla-line';
const qiblaPointSource = 'qibla-point';

const emptyFeatureCollection: GeoJSON.FeatureCollection = {
	type: 'FeatureCollection',
	features: []
};

export const addQiblaLayers = (map: Map): void => {
	map.addSource(qiblaLineSource, { type: 'geojson', data: emptyFeatureCollection });
	map.addSource(qiblaPointSource, { type: 'geojson', data: emptyFeatureCollection });

	map.addLayer({
		id: 'qibla-direction-background',
		type: 'line',
		source: qiblaLineSource,
		layout: { 'line-cap': 'round' },
		paint: {
			'line-color': white,
			'line-width': 8,
		}
	});
	map.addLayer({
		id: 'qibla-source-background',
		type: 'circle',
		source: qiblaPointSource,
		paint: {
			'circle-color': white,
			'circle-radius': 8,
		}
	});
	map.addLayer({
		id: 'qibla-direction-foreground',
		type: 'line',
		source: qiblaLineSource,
		layout: { 'line-cap': 'round' },
		paint: {
			'line-color': primaryGreen,
			'line-width': 4
		}
	});
	map.addLayer({
		id: 'qibla-source-foreground',
		type: 'circle',
		source: qiblaPointSource,
		paint: {
			'circle-color': primaryGreen,
			'circle-radius': 6
		}
	});
	map.addLayer({
		id: 'qibla-label',
		type: 'symbol',
		source: qiblaLineSource,
		layout: {
			'symbol-placement': 'line',
			'text-field': [ 'get', 'label' ],
			'text-font': [ 'Open Sans Regular' ],
			'text-size': 14,
			'text-letter-spacing': 0.05
		},
		paint: {
			'text-color': primaryGreen,
			'text-halo-color': white,
			'text-halo-width': 2
		}
	});
};

export const showQibla = (map: Map, position: [ number, number ]): void => {
	const lineSource = map.getSource<GeoJSONSource>(qiblaLineSource);
	const pointSource = map.getSource<GeoJSONSource>(qiblaPointSource);

	if (!lineSource || !pointSource) return;

	lineSource.setData({
		type: 'Feature',
		properties: {
			label: getQiblaLabel(position, kaabaCoordinates)
		},
		geometry: {
			type: 'LineString',
			coordinates: getGreatCirclePoints(position, kaabaCoordinates)
		}
	});
	pointSource.setData({
		type: 'Feature',
		properties: {},
		geometry: {
			type: 'Point',
			coordinates: position
		}
	});
};
