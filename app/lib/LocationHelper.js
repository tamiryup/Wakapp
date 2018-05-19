/**
 * @author Tamir Ishay sharbat
 *
 * for explanations: http://www.movable-type.co.uk/scripts/latlong.html
 */

// Radius of the earth in km
var R = 6371.1;

function distance(lat1, lon1, lat2, lon2) {
	var R = 6371.1;
	var dLat = deg2rad(lat2 - lat1);
	// deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	// Distance in km
	return d;
}

/**
 *
 * @param {Object} lat1 - starting point latitude (in degrees)
 * @param {Object} lon1 - starting point longitude (in degrees)
 * @param {Object} lat2 - ending point latitude (in degrees)
 * @param {Object} lon2 - ending point longitude (in degrees)
 *
 * @return the bearing in degrees.
 */
function bearing(lat1, lon1, lat2, lon2) {
	var dLon = deg2rad(lon2 - lon1);
	var phi1 = deg2rad(lat1);
	var phi2 = deg2rad(lat2);
	var y = Math.sin(dLon) * Math.cos(phi2);
	var x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
	var brng = Math.atan2(y, x);
	return rad2deg(brng);
}

/**
 *
 * @param {Object} lat1 - starting point latitude (in degrees)
 * @param {Object} lon1 - starting point longitude (in degrees)
 * @param {Object} distance - distance from starting point (in kilometers)
 * @param {Object} bearing - the bearing you want (in degrees)
 */
function calcDestination(lat1, lon1, distance, bearing) {
	var deltaAngle = distance / R;
	var phi1 = deg2rad(lat1);
	var brng = deg2rad(bearing);
	var lambda1 = deg2rad(lon1);
	var phi2 = Math.asin(Math.sin(phi1) * Math.cos(deltaAngle) + //
	Math.cos(phi1) * Math.sin(deltaAngle) * Math.cos(brng));
	var lambda2 = lambda1 + Math.atan2(Math.sin(brng) * Math.sin(deltaAngle) * Math.cos(phi1), Math.cos(deltaAngle) - //
	Math.sin(phi1) * Math.sin(phi2));
	return {
		lat : rad2deg(phi2),
		lon : rad2deg(lambda2)
	};
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

function rad2deg(rad) {
	return rad * (180 / Math.PI);
}

exports.distance = distance;
exports.bearing=bearing;
exports.calcDestination=calcDestination;
