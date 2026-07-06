import { load } from '@loaders.gl/core';
import { GLTFLoader } from '@loaders.gl/gltf';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { kaabaCoordinates } from './constants';

const getKaabaLayer = async (): Promise<ScenegraphLayer> => {
  const scenegraph = await load('/Box/Box.gltf', GLTFLoader);

  return new ScenegraphLayer({
    id: 'kaaba-model',
    data: [ { position: kaabaCoordinates } ],
    scenegraph,
    getPosition: (d: any) => [ d.position[0], d.position[1], 1 ],
    getOrientation: (): [ number, number, number ] => [ 0, 32, 90 ],
    sizeMinPixels: 40,
    sizeScale: 20,
    _lighting: 'pbr'
  });
};

export default getKaabaLayer;
