import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, SolidPolygonLayer } from '@deck.gl/layers';
import { googleMapsAPIKey } from './constants';

const getGoogleTileLayer = (
  satelliteSessionToken: string,
  roadmapSessionToken: string
): (SolidPolygonLayer | TileLayer)[] => [
  new SolidPolygonLayer({
    id: 'background',
    data: [
      [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
    ],
    getPolygon: d => d,
    stroked: false,
    filled: true,
    getFillColor: [255, 255, 255]
  }),
  new TileLayer({
    id: 'google-roadmap',
    data: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${roadmapSessionToken}&key=${googleMapsAPIKey}`,
    minZoom: 0,
    maxZoom: 10,
    tileSize: 256,
    renderSubLayers: (props: any) => {
      const { west, south, east, north } = props.tile.bbox;

      return new BitmapLayer(props as any, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      } as any);
    }
  }),
  new TileLayer({
    id: 'google-satellite',
    data: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${satelliteSessionToken}&key=${googleMapsAPIKey}`,
    minZoom: 10,
    maxZoom: 22,
    tileSize: 256,
    renderSubLayers: (props: any) => {
      const { west, south, east, north } = props.tile.bbox;

      return new BitmapLayer(props as any, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      } as any);
    }
  }),
];

export default getGoogleTileLayer;
