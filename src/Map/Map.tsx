import { Map as MaplibreMap, NavigationControl } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { LineLayer } from '@deck.gl/layers';
import getSessionToken, { SessionTokenRequestResponse } from "./getSessionToken";
import { defaultZoom, kaabaCoordinates, kaabaCoordinates3D, primaryGreenRGB } from "./constants";
import kaabaModelUrl from "../assets/holy kaaba/scene.gltf?url";
import getBasemapStyle from "./getBasemapStyle";

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [ clickedPosition, setClickedPosition ] = useState<[number, number] | null>(null);
  const [ map, setMap ] = useState<MaplibreMap | undefined>(undefined);
  const [ zoom, setZoom ] = useState<number>(defaultZoom);
  const deckOverlayRef = useRef<MapboxOverlay | null>(null);

  const kaaba3D = useMemo(() => {
    console.log('rerender?')
    return (

      new ScenegraphLayer({
        id: 'kaaba-model',
        data: [{ position: kaabaCoordinates3D }],
        scenegraph: kaabaModelUrl,
        getPosition: (d: any) => [d.position[0], d.position[1], 0],
        getOrientation: (_d: any) => [0, 32, 90],
        sizeScale: 10,
        _lighting: 'pbr'
      })
    );
  }, [ zoom ]);

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
          zoom: defaultZoom,
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
          interleaved: true
        });

        newMap.addControl(deckOverlay as any);
        newMap.on('click', (e) => {
          setClickedPosition([e.lngLat.lng, e.lngLat.lat]);
        });
        newMap.on('zoom', () => {
          const roundedZoom: number = Math.round(newMap.getZoom());
          if (roundedZoom === zoom) {
            setZoom(roundedZoom);
          }
        })

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
          getWidth: 4,
          getSourcePosition: (d: LineData): [ number, number, number] => [d.source[0], d.source[1], 0],
          getTargetPosition: (d: LineData): [ number, number, number] => [d.target[0], d.target[1], 0],
          getColor: primaryGreenRGB,
        })
      ]);
    }

    deckOverlayRef.current.setProps({ layers });
  }, [ clickedPosition, zoom ]);

  return (
    <div id="map" ref={ mapContainerRef } />
  )
}

export default Map;
