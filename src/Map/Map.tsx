import { Map as MaplibreMap, NavigationControl } from "maplibre-gl";
import { useEffect, useRef, useState } from "preact/hooks";
import "maplibre-gl/dist/maplibre-gl.css";
import getSessionToke, { SessionTokenRequestResponse } from "./getSessionToken";
import getSessionToken from "./getSessionToken";
import { googleMapsAPIKey, kaabaCoordinates } from "./constants";

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [ map, setMap ] = useState<MaplibreMap>();

  useEffect(() => {
    console.log('effect')
    getSessionToken()
      .then((
        response: SessionTokenRequestResponse
      ) => {
      const newMap = new MaplibreMap({
        container: mapContainerRef.current,
        style: {
          version: 8,
          projection: {
            type: 'globe'
          },
          sources: {
            osm: {
              type: "raster",
              tiles: [ "https://tile.openstreetmap.org/{z}/{x}/{y}.png" ],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            googleHybrid: {
              type: "raster",
              tiles: [`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${ response.session }&key=${ googleMapsAPIKey }`],
              tileSize: 256
            }
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 14
            },
            {
              id: "googleHybrid",
              type: "raster",
              source: "googleHybrid",
              minzoom: 14,
              maxzoom: 19
            },
          ]
        },
        center: kaabaCoordinates,
        zoom: 16,
      });

      newMap.addControl(
        new NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        })
      );

      setMap(newMap);
    });

  }, [ mapContainerRef ]);

  return (
    <div id="map" ref={ mapContainerRef } />
  )
}

export default Map;
