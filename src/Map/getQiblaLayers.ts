import type { GeoJSONSource, Map } from 'maplibre-gl';
import bearing from '@turf/bearing';
import { point } from '@turf/helpers';
import getGreatCirclePoints from './greatCircle';
import getQiblaLabel from './getQiblaLabel';
import { kaabaCoordinates, primaryGreen, white } from './constants';

const getLabelOffset = (source: [ number, number ]): [ number, number ] => {
	const degrees = bearing(point(source), point(kaabaCoordinates));
	const radians = (degrees * Math.PI) / 180;

	return [
		-Math.sin(radians) * 4.5,
		Math.cos(radians) * 2
	];
};

const qiblaLineSource = 'qibla-line';
const qiblaPointSource = 'qibla-point';

const emptyFeatureCollection: GeoJSON.FeatureCollection = {
	type: 'FeatureCollection',
	features: []
};

export const addQiblaLayers = (map: Map, includeLabel = true): void => {
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
	if (includeLabel) {
		map.addLayer({
			id: 'qibla-label',
			type: 'symbol',
			source: qiblaPointSource,
			layout: {
				'symbol-placement': 'point',
				'text-field': [ 'get', 'label' ],
				'text-font': [ 'Open Sans Regular' ],
				'text-size': 18,
				'text-letter-spacing': 0.05,
				'text-anchor': 'center',
				'text-offset': [ 'get', 'labelOffset' ]
			},
			paint: {
				'text-color': primaryGreen,
				'text-halo-color': white,
				'text-halo-width': 2
			}
		});
	}
};

export const showQibla = (map: Map, position: [ number, number ]): void => {
	const lineSource = map.getSource<GeoJSONSource>(qiblaLineSource);
	const pointSource = map.getSource<GeoJSONSource>(qiblaPointSource);

	if (!lineSource || !pointSource) return;

	lineSource.setData({
		type: 'Feature',
		properties: {},
		geometry: {
			type: 'LineString',
			coordinates: getGreatCirclePoints(position, kaabaCoordinates)
		}
	});
	pointSource.setData({
		type: 'Feature',
		properties: {
			label: getQiblaLabel(position, kaabaCoordinates),
			labelOffset: getLabelOffset(position)
		},
		geometry: {
			type: 'Point',
			coordinates: position
		}
	});
};
