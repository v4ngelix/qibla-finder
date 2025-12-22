import { render } from 'preact';
import Map from "./Map";

import './style.css';

export function App() {
	return (
		<Map />
	);
}

render(<App />, document.getElementById('app'));
