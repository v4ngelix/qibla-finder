import { Deck, _GlobeView as GlobeView, type PickingInfo } from '@deck.gl/core';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers';
import type { ScenegraphLayer } from '@deck.gl/mesh-layers';
import getSessionToken, { SessionTokenRequestResponse } from './getSessionToken';
import getGoogleTileLayer from './getGoogleTileLayer';
import getKaabaLayer from './getKaabaLayer';
import {
  backgroundOpacity,
  defaultZoom,
  kaabaCoordinates,
  primaryGreenRGB,
  whiteRGB
} from './constants';

type QiblaSegment = {
  source: [ number, number ];
  target: [ number, number ];
};

const getQiblaLayers = (
  clickedPosition: [ number, number ]
): unknown[] => {
  const data: QiblaSegment[] = [
    { source: clickedPosition, target: kaabaCoordinates }
  ];

  return [
    new ArcLayer<QiblaSegment>({
      id: 'qibla-direction-background',
      data,
      getSourcePosition: (d: QiblaSegment): [ number, number ] => d.source,
      getTargetPosition: (d: QiblaSegment): [ number, number ] => d.target,
      getSourceColor: whiteRGB,
      getTargetColor: whiteRGB,
      getWidth: 8,
      widthUnits: 'pixels',
      opacity: backgroundOpacity,
      greatCircle: true,
      getHeight: 0,
      parameters: {
        cullMode: "none"
      }
    }),
    new ScatterplotLayer({
      id: 'qibla-source-background',
      data: [ clickedPosition ],
      getPosition: (d: any): [ number, number ] => d,
      getFillColor: whiteRGB,
      opacity: backgroundOpacity,
      getRadius: 8,
      radiusUnits: 'pixels',
      parameters: { depthTest: false }
    }),
    new ArcLayer<QiblaSegment>({
      id: 'qibla-direction-foreground',
      data,
      getSourcePosition: (d: QiblaSegment): [ number, number ] => d.source,
      getTargetPosition: (d: QiblaSegment): [ number, number ] => d.target,
      getSourceColor: primaryGreenRGB,
      getTargetColor: primaryGreenRGB,
      getWidth: 4,
      widthUnits: 'pixels',
      greatCircle: true,
      getHeight: 0,
      parameters: {
        cullMode: "none"
      }
    }),
    new ScatterplotLayer({
      id: 'qibla-source-foreground',
      data: [ clickedPosition ],
      getPosition: (d: any): [ number, number ] => d,
      getFillColor: primaryGreenRGB,
      getRadius: 6,
      radiusUnits: 'pixels',
      parameters: { depthTest: false }
    })
  ];
};

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Deck<any> | null>(null);
  const baseLayerRef = useRef<unknown | null>(null);
  const kaabaLayerRef = useRef<unknown | null>(null);
  const [ clickedPosition, setClickedPosition ] = useState<[ number, number ] | null>(null);

  const initializeMap = (
    centerPointOverride?: [ number, number ]
  ): void => {
    Promise.all([
      getSessionToken('satellite'),
      getSessionToken('roadmap'),
      getKaabaLayer(),
    ])
      .then((
        [ satelliteResponse, roadmapResponse, kaabaLayer ]: [ SessionTokenRequestResponse, SessionTokenRequestResponse, ScenegraphLayer ]
      ): void => {
        const [ longitude, latitude ] = centerPointOverride ?? kaabaCoordinates;
        const baseLayer = getGoogleTileLayer(satelliteResponse.session, roadmapResponse.session,);
        baseLayerRef.current = baseLayer;
        kaabaLayerRef.current = kaabaLayer;

        deckRef.current = new Deck({
          parent: mapContainerRef.current ?? undefined,
          views: [ new GlobeView({
            resolution: 15,
          }) ],
          initialViewState: {
            longitude,
            latitude,
            zoom: defaultZoom,
            minZoom: 3
          } as any,
          controller: true,
          layers: [ ...baseLayer, kaabaLayer ] as any,
          onClick: (info: PickingInfo): void => {
            if (info.coordinate) {
              setClickedPosition([ info.coordinate[0], info.coordinate[1] ]);
            }
          },
          parameters: {
            cullMode: 'none',
          }
        });
      });
  };

  useEffect((): (() => void) => {
    if (deckRef.current === null) {
      if (navigator?.geolocation?.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition): void => {
            initializeMap([ position.coords.longitude, position.coords.latitude ]);
          },
          (): void => initializeMap()
        );
      } else {
        initializeMap();
      }
    }

    return (): void => {
      deckRef.current?.finalize();
      deckRef.current = null;
    };
  }, []);

  useEffect((): void => {
    if (deckRef.current === null || baseLayerRef.current === null) return;

    const layers: unknown[] = [ baseLayerRef.current ];

    if (clickedPosition) {
      layers.push(...getQiblaLayers(clickedPosition));
    }

    if (kaabaLayerRef.current) {
      layers.push(kaabaLayerRef.current);
    }
    deckRef.current.setProps({ layers: layers as any });
  }, [ clickedPosition ]);

  return (
    <div id="map" ref={ mapContainerRef } />
  );
}

export default Map;
