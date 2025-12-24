import { render } from 'preact';
import Map from './Map';
import Instruction from './Instruction';

import './style.css';

export function App() {
	return (
		<>
			<Map />
			<Instruction />
		</>
	);
}

render(<App />, document.getElementById('app'));
