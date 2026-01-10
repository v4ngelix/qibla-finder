import { useEffect, useRef, useState } from 'preact/hooks';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import { defaultZoom, kaabaCoordinates, primaryGreenRGB } from './constants';

export type Position = [number, number, number];

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null);
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
  const deckOverlayRef = useRef<GoogleMapsOverlay | null>(null);

  const kaaba3D = new ScenegraphLayer({
    id: 'kaaba-model',
    data: [{ position: kaabaCoordinates }],
    scenegraph: '/Box/Box.gltf',
    getPosition: (d: any): Position => [d.position[0], d.position[1], 1],
    getOrientation: (_d: any): [number, number, number] => [0, 32, 90],
    sizeMinPixels: 40,
    getPolygonOffset: (): [number, number] => [.5, .5],
    _lighting: 'pbr'
  });

  const initializeMap = async (
    centerPointOverride?: [number, number]
  ): Promise<void> => {
    const { Map: GoogleMap } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;

    const center = centerPointOverride ?? kaabaCoordinates;

    const newMap = new GoogleMap(mapContainerRef.current!, {
      center: { lat: center[1], lng: center[0] },
      zoom: defaultZoom,
      tilt: 45,
      mapId: 'qibla-finder-map',
      mapTypeId: 'hybrid',
      disableDefaultUI: true,
      mapTypeControl: true
    });

    const deckOverlay = new GoogleMapsOverlay({
      layers: [kaaba3D]
    });

    deckOverlay.setMap(newMap);

    newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        setClickedPosition([e.latLng.lng(), e.latLng.lat()]);
      }
    });

    deckOverlayRef.current = deckOverlay;
    setMap(newMap);
  };

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
