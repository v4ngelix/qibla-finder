import { googleMapsAPIKey, mapTileAPIKey, primaryGreenHEX } from "./constants";
import type { StyleSpecification } from "maplibre-gl";
import basestyle from './style.json';

const getBasemapStyle = (
  sessionToken: string
): StyleSpecification => {
  console.log('KANA', sessionToken, googleMapsAPIKey)

  let basemapStyleString: string = JSON.stringify(basestyle);
  basemapStyleString = basemapStyleString.replace('{key}', mapTileAPIKey);
  basemapStyleString = basemapStyleString.replace('{google-maps-session-token}', sessionToken);
  basemapStyleString = basemapStyleString.replace('{google-maps-api-key}', googleMapsAPIKey);
  basemapStyleString = basemapStyleString.replace('{map-background-color}', primaryGreenHEX);

  return JSON.parse(basemapStyleString)
};

export default getBasemapStyle;
