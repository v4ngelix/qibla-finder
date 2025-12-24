import { Map as MaplibreMap, NavigationControl } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { LineLayer } from '@deck.gl/layers';
import getSessionToken, { SessionTokenRequestResponse } from "./getSessionToken";
import { kaabaCoordinates, primaryGreenRGB } from "./constants";
import kaabaModelUrl from "../assets/holy kaaba/scene.gltf?url";
import getBasemapStyle from "./getBasemapStyle";

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [ clickedPosition, setClickedPosition ] = useState<[number, number] | null>(null);
  const [ map, setMap ] = useState<MaplibreMap | undefined>(undefined);
  const deckOverlayRef = useRef<MapboxOverlay | null>(null);

  const kaaba3D = (
    new ScenegraphLayer({
      id: 'kaaba-model',
      data: [{ position: kaabaCoordinates }],
      scenegraph: kaabaModelUrl,
      getPosition: (d: any) => d.position,
      getOrientation: (_d: any) => [0, 32, 90],
      sizeMinPixels: 20,
      sizeScale: 1,
      _lighting: 'pbr'
    })
  );

  useEffect((): void => {
    if (map === undefined) {
      console.log('effect')
      getSessionToken()
        .then((
          response: SessionTokenRequestResponse
        ): void => {
        const newMap = new MaplibreMap({
          container: mapContainerRef.current,
          style: getBasemapStyle(response.session),
          center: kaabaCoordinates,
          zoom: 8,
          maxZoom: 18,
        });

        newMap.addControl(
          new NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true
          })
        );

        const deckOverlay = new MapboxOverlay({
          layers: [
            kaaba3D
          ],
          interleaved: false
        });

        newMap.addControl(deckOverlay as any);
        newMap.on('click', (e) => {
          setClickedPosition([e.lngLat.lng, e.lngLat.lat]);
        });

        deckOverlayRef.current = deckOverlay;
        setMap(newMap);
      });
    }
  }, [ mapContainerRef ]);

  useEffect((): void => {
    if (!deckOverlayRef.current) return;

    const layers: any[] = [
      kaaba3D
    ];

    if (clickedPosition) {
      console.log("clickedPosition", clickedPosition);
      type LineData = {
        source: [number, number];
        target: [number, number];
      };

      layers.push([
        new LineLayer<LineData>({
          id: 'qibla-direction-line',
          data: [{
            source: clickedPosition,
            target: kaabaCoordinates
          }],
          getWidth: 2,
          getSourcePosition: (d: LineData): [ number, number, number] => [d.source[0], d.source[1], 0],
          getTargetPosition: (d: LineData): [ number, number, number] => [d.target[0], d.target[1], 0],
          getColor: primaryGreenRGB,
        })
      ]);
    }

    deckOverlayRef.current.setProps({ layers });
  }, [ clickedPosition ]);

  return (
    <div id="map" ref={ mapContainerRef } />
  )
}

export default Map;
