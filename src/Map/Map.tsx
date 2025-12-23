import { Map as MaplibreMap, NavigationControl } from "maplibre-gl";
import { useEffect, useRef, useState } from "preact/hooks";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import getSessionToken, { SessionTokenRequestResponse } from "./getSessionToken";
import { googleMapsAPIKey, kaabaCoordinates } from "./constants";
import kaabaModelUrl from "../assets/holy kaaba/scene.gltf?url";

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
            },
          ]
        },
        center: kaabaCoordinates,
        zoom: 18,
        maxZoom: 18,
        pitchWithRotate: false,
        dragRotate: false,
        touchZoomRotate: false
      });

      newMap.addControl(
        new NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        })
      );

      // Add deck.gl ScenegraphLayer for Kaaba 3D model
      const deckOverlay = new MapboxOverlay({
        layers: [
          new ScenegraphLayer({
            id: 'kaaba-model',
            data: [{ position: [...kaabaCoordinates, 0] }],
            scenegraph: kaabaModelUrl,
            getPosition: (d: any) => d.position,
            getOrientation: (d: any) => [0, 0, 90],
            sizeScale: 1,
            _lighting: 'pbr'
          } as any)
        ]
      });

      newMap.addControl(deckOverlay as any);

      setMap(newMap);
    });

  }, [ mapContainerRef ]);

  return (
    <div id="map" ref={ mapContainerRef } />
  )
}

export default Map;
