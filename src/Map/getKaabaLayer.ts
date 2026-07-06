import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CustomLayerInterface, CustomRenderMethodInput, Map } from 'maplibre-gl';
import {
	kaabaCoordinates,
	kaabaModelReferenceZoom,
	kaabaModelRotationDegrees,
	kaabaModelScale
} from './constants';

// glTF models are y-up while the map's model frame is z-up.
const yUpToZUp = new THREE.Matrix4().makeRotationX(Math.PI / 2);
const kaabaRotation = new THREE.Matrix4().makeRotationZ(
	kaabaModelRotationDegrees * Math.PI / 180
);
const kaabaScale = new THREE.Matrix4();

const getKaabaLayer = (): CustomLayerInterface => {
	let map: Map;
	let camera: THREE.Camera;
	let scene: THREE.Scene;
	let renderer: THREE.WebGLRenderer;

	return {
		id: 'kaaba-model',
		type: 'custom',
		renderingMode: '3d',

		onAdd(mapInstance: Map, gl: WebGL2RenderingContext): void {
			map = mapInstance;
			camera = new THREE.Camera();
			scene = new THREE.Scene();

			scene.add(new THREE.AmbientLight(0xffffff, 1));
			const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
			directionalLight.position.set(50, 100, 100);
			scene.add(directionalLight);

			new GLTFLoader().load('/Box/Box.gltf', (gltf): void => {
				scene.add(gltf.scene);
				map.triggerRepaint();
			});

			renderer = new THREE.WebGLRenderer({
				canvas: map.getCanvas(),
				context: gl,
				antialias: true
			});
			renderer.autoClear = false;
		},

		render(_gl: WebGL2RenderingContext, args: CustomRenderMethodInput): void {
			const modelMatrix = map.transform.getMatrixForModel(kaabaCoordinates, 0);
			// Ground meters per screen pixel halve with each zoom level, so
			// counter-scale the model to keep its on-screen size constant.
			const scale = kaabaModelScale
				* 2 ** (kaabaModelReferenceZoom - map.getZoom());
			kaabaScale.makeScale(scale, scale, scale);
			camera.projectionMatrix = new THREE.Matrix4()
				.fromArray(args.defaultProjectionData.mainMatrix)
				.multiply(new THREE.Matrix4().fromArray(modelMatrix))
				.multiply(kaabaScale)
				.multiply(kaabaRotation)
				.multiply(yUpToZUp);

			renderer.resetState();
			renderer.render(scene, camera);
		},

		onRemove(): void {
			renderer.dispose();
		}
	};
};

export default getKaabaLayer;
