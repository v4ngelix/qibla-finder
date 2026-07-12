import { render } from 'preact';
import Map, { Minimap } from './Map';
import Instruction from './Instruction';

import './style.css';

export function App() {
	return (
		<>
			<Map />
			<Minimap />
			<Instruction />
		</>
	);
}

render(<App />, document.getElementById('app'));
