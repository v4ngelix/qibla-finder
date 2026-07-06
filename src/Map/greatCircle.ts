type LngLat = [ number, number ];
type Vec3 = [ number, number, number ];

const toRadians = (degrees: number): number => degrees * Math.PI / 180;
const toDegrees = (radians: number): number => radians * 180 / Math.PI;

const toCartesian = ([ lng, lat ]: LngLat): Vec3 => {
	const lngRad = toRadians(lng);
	const latRad = toRadians(lat);

	return [
		Math.cos(latRad) * Math.cos(lngRad),
		Math.cos(latRad) * Math.sin(lngRad),
		Math.sin(latRad)
	];
};

const toLngLat = ([ x, y, z ]: Vec3): LngLat => [
	toDegrees(Math.atan2(y, x)),
	toDegrees(Math.asin(z))
];

// Shift each longitude by full turns so the line stays continuous
// instead of jumping across the antimeridian.
const unwrapLongitudes = (points: LngLat[]): LngLat[] => {
	let offset = 0;

	return points.map(([ lng, lat ], index): LngLat => {
		if (index > 0) {
			const previousLng = points[index - 1][0] + offset;
			if (lng + offset - previousLng > 180) offset -= 360;
			if (lng + offset - previousLng < -180) offset += 360;
		}

		return [ lng + offset, lat ];
	});
};

const getGreatCirclePoints = (
	source: LngLat,
	target: LngLat,
	segmentCount = 256
): LngLat[] => {
	const a = toCartesian(source);
	const b = toCartesian(target);
	const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

	if (angle < 1e-6) return [ source, target ];

	const points: LngLat[] = [ source ];

	for (let i = 1; i < segmentCount; i++) {
		const fraction = i / segmentCount;
		const scaleA = Math.sin((1 - fraction) * angle) / Math.sin(angle);
		const scaleB = Math.sin(fraction * angle) / Math.sin(angle);

		points.push(toLngLat([
			scaleA * a[0] + scaleB * b[0],
			scaleA * a[1] + scaleB * b[1],
			scaleA * a[2] + scaleB * b[2]
		]));
	}

	points.push(target);

	return unwrapLongitudes(points);
};

export default getGreatCirclePoints;
