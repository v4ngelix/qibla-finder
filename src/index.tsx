import { render } from 'preact';
import Map from './Map';
import Minimap from './Minimap';
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
