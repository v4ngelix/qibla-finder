import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	server: {
		open: true,
	},
	assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.bin'],
	build: {
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					// Keep GLTF and BIN files with their original names
					if (assetInfo.name?.endsWith('.gltf') || assetInfo.name?.endsWith('.bin')) {
						return 'assets/[name][extname]';
					}
					return 'assets/[name]-[hash][extname]';
				}
			}
		}
	}
});
