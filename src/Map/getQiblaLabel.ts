import bearing from '@turf/bearing';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

type LngLat = [ number, number ];

const getQiblaLabel = (source: LngLat, target: LngLat): string => {
	const from = point(source);
	const to = point(target);

	const angle: number = bearing(from, to) + 180;
	const kilometers: number = distance(from, to, { units: 'kilometers' });
	let distanceValue: number = 0;
	let distanceUnit: string = 'km';

	if (kilometers < 1) {
		distanceValue = Math.round(kilometers * 1000);
		distanceUnit = 'm';
	} else if (kilometers < 10) {
		distanceValue = Number(kilometers.toFixed(1));
	} else {
		distanceValue = Math.round(kilometers);
	}

	return `${Math.round(angle)}° · ${distanceValue.toLocaleString('en-US')} ${distanceUnit}`;
};

export default getQiblaLabel;