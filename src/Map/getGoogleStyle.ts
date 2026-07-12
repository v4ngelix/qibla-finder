import type { StyleSpecification } from 'maplibre-gl';
import { googleMapsAPIKey, maxZoom, satelliteMinZoom, white } from './constants';
import type { SessionTokens } from './getSessionToken';

const getTileURL = (sessionToken: string): string =>
	`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${googleMapsAPIKey}`;

const getGoogleStyle = (sessionTokens: SessionTokens): StyleSpecification => ({
	version: 8,
	projection: { type: 'globe' },
	glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
	sources: {
		'google-roadmap': {
			type: 'raster',
			tiles: [ getTileURL(sessionTokens.roadmap) ],
			tileSize: 256,
			maxzoom: satelliteMinZoom,
			attribution: '&copy; Google'
		},
		'google-satellite': {
			type: 'raster',
			tiles: [ getTileURL(sessionTokens.satellite) ],
			tileSize: 256,
			minzoom: satelliteMinZoom,
			maxzoom: maxZoom,
			attribution: '&copy; Google'
		}
	},
	layers: [
		{
			id: 'background',
			type: 'background',
			paint: { 'background-color': white }
		},
		{
			id: 'google-roadmap',
			type: 'raster',
			source: 'google-roadmap',
			maxzoom: satelliteMinZoom
		},
		{
			id: 'google-satellite',
			type: 'raster',
			source: 'google-satellite',
			minzoom: satelliteMinZoom
		}
	]
});

export default getGoogleStyle;
