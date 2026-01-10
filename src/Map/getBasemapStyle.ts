import { googleMapsAPIKey, primaryGreenHEX } from "./constants";
import type { StyleSpecification } from "maplibre-gl";

const getBasemapStyle = (
  sessionToken: string
): StyleSpecification => {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [ "https://tile.openstreetmap.org/{z}/{x}/{y}.png" ],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      googleHybrid: {
        type: "raster",
        tiles: [`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${ sessionToken }&key=${ googleMapsAPIKey }`],
        tileSize: 256
      }
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": primaryGreenHEX,
        }
      },
      {
        id: "osm",
        type: "raster",
        source: "osm",
        minzoom: 0,
      },
      {
        id: "googleHybrid",
        type: "raster",
        source: "googleHybrid",
        minzoom: 14,
      }
    ]
  }
};

export default getBasemapStyle;
