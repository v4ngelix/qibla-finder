import bearing from '@turf/bearing';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

type LngLat = [ number, number ];

// Bearing measured clockwise from north, distance to Mecca in kilometres.
const getQiblaLabel = (source: LngLat, target: LngLat): string => {
	const from = point(source);
	const to = point(target);

	const angle = bearing(from, to) +180;
	const kilometres = distance(from, to, { units: 'kilometers' });

	return `${Math.round(angle)}° · ${Math.round(kilometres).toLocaleString('en-US')} km`;
};

export default getQiblaLabel;