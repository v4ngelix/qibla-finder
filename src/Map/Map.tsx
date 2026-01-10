import { Map as MaplibreMap, NavigationControl } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'preact/hooks';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import getSessionToken, { SessionTokenRequestResponse } from './getSessionToken';
import { defaultZoom, kaabaCoordinates, primaryGreenRGB } from './constants';
import getBasemapStyle from './getBasemapStyle';

export type Position = [ number, number, number ];

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [ clickedPosition, setClickedPosition ] = useState<[number, number] | null>(null);
  const [ map, setMap ] = useState<MaplibreMap | undefined>(undefined);
  const deckOverlayRef = useRef<MapboxOverlay | null>(null);

  const initializeMap = (
    centerPointOverride?: [ number, number ]
  ): void => {
    getSessionToken()
      .then((
        response: SessionTokenRequestResponse
      ): void => {
        const newMap = new MaplibreMap({
          container: mapContainerRef.current,
          style: getBasemapStyle(response.session),
          center: centerPointOverride ?? kaabaCoordinates,
          zoom: defaultZoom,
          pitch: 45
        });

        newMap.addControl(
          new NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true
          })
        );

        const deckOverlay = new MapboxOverlay({
          layers: [ kaaba3D ]
        });

        newMap.addControl(deckOverlay as any);
        newMap.on('click', (e) => {
          setClickedPosition([e.lngLat.lng, e.lngLat.lat]);
        });

        deckOverlayRef.current = deckOverlay;
        setMap(newMap);
      });
  }

  const kaaba3D = new ScenegraphLayer({
    id: 'kaaba-model',
    data: [{ position: kaabaCoordinates }],
    scenegraph: '/Box/Box.gltf',
    getPosition: (d: any): Position => [d.position[0], d.position[1], 1],
    getOrientation: (_d: any): [ number, number, number ] => [0, 32, 90],
    sizeMinPixels: 40,
    getPolygonOffset: (): [ number, number ] => [ .5, .5],
    _lighting: 'pbr'
  });

  useEffect((): void => {
    if (map === undefined) {

      if (navigator?.geolocation?.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition): void => {
            const centerPointOverride: [ number, number ] = [ position.coords.longitude, position.coords.latitude ];
            initializeMap(centerPointOverride);
          },
          () => initializeMap()
        );
      } else {
        initializeMap();
      }
    }
  }, [ mapContainerRef ]);

  useEffect((): void => {
    if (!deckOverlayRef.current) return;

    const layers: any[] = [ kaaba3D ];

    if (clickedPosition) {
      type LineData = {
        source: [ number, number ];
        target: [ number, number ];
      };

      layers.push([
        new LineLayer<LineData>({
          id: 'qibla-direction-line',
          data: [{
            source: clickedPosition,
            target: kaabaCoordinates
          }],
          getWidth: 4,
          getSourcePosition: (d: LineData): Position => [d.source[0], d.source[1], 0],
          getTargetPosition: (d: LineData): Position => [d.target[0], d.target[1], 0],
          getColor: primaryGreenRGB,
        }),
        new ScatterplotLayer({
          id: 'qibla-direction-source',
          data: [ clickedPosition ],
          getWidth: 4,
          getPosition: (d: any): Position => d,
          getFillColor: (): [ number, number, number ] => primaryGreenRGB,
          radiusMinPixels: 4
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
