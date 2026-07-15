import type { StyleSpecification } from 'maplibre-gl';
import { googleMapsAPIKey, white } from './constants';
import type { SessionTokens } from './getSessionToken';

const getTileURL = (sessionToken: string): string =>
	`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken}&key=${googleMapsAPIKey}`;

const getMinimapStyle = (sessionTokens: SessionTokens): StyleSpecification => ({
	version: 8,
	projection: { type: 'mercator' },
	glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
	sources: {
		'google-roadmap': {
			type: 'raster',
			tiles: [ getTileURL(sessionTokens.minimap) ],
			tileSize: 256,
			maxzoom: 20,
			attribution: '&copy; Google'
		}
	},
	layers: [
		{
			id: 'google-roadmap',
			type: 'raster',
			source: 'google-roadmap'
		}
	]
});

export default getMinimapStyle;
