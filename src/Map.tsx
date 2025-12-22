import { Map as MaplibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "preact/hooks";

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [ map, setMap ] = useState<MaplibreMap>();

  useEffect(() => {
    const newMap = new MaplibreMap({
      container: mapContainerRef.current,
    });

    setMap(newMap);
  }, []);

  return (
    <div id="map" ref={ mapContainerRef } />
  )
}

export default Map;
