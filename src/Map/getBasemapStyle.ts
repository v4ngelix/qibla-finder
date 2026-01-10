import { googleMapsAPIKey, mapTileAPIKey, primaryGreenHEX } from "./constants";
import type { StyleSpecification } from "maplibre-gl";
import basestyle from './style.json';

const getBasemapStyle = (
  sessionToken: string
): StyleSpecification => {


  let basemapStyleString: string = JSON.stringify(basestyle);
  basemapStyleString = basemapStyleString.replace(/\{key}/g, mapTileAPIKey);
  basemapStyleString = basemapStyleString.replace('{map-background-color}', primaryGreenHEX);

  if (sessionToken) {
    basemapStyleString = basemapStyleString.replace('{google-maps-session-token}', sessionToken);
    basemapStyleString = basemapStyleString.replace('{google-maps-api-key}', googleMapsAPIKey);
    const basemapStyleObject = JSON.parse(basemapStyleString);
    const layers = basemapStyleObject.layers;
    basemapStyleObject.layers = [
      ...layers,
      {
        "id": "google-hybrid",
        "type": "raster",
        "source": "google-hybrid",
        "minzoom": 14
      }
    ];
    return basemapStyleObject;
  }

  return JSON.parse(basemapStyleString)
};

export default getBasemapStyle;
