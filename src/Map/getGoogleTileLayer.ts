import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { googleMapsAPIKey } from './constants';

const getGoogleTileLayer = (
  sessionToken: string
): TileLayer =>
  new TileLayer({
    id: 'google',
    data: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${ sessionToken }&key=${ googleMapsAPIKey }`,
    minZoom: 0,
    maxZoom: 22,
    tileSize: 256,
    renderSubLayers: (props: any) => {
      const { west, south, east, north } = props.tile.bbox;

      return new BitmapLayer(props as any, {
        data: null,
        image: props.data,
        bounds: [ west, south, east, north ]
      } as any);
    }
  });

export default getGoogleTileLayer;
