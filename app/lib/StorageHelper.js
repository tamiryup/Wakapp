/**
 * helps with storage
 */

/**
 * the function recieves an array representing a sound list of an alarm.
 * returns a stringified version of the array.
 *
 * HOW IT WORKS:
 * the stringification follows the following rules:
 * 1. if the element has an item property: add the item property to the output.
 * 2. otherwise, add the row title to the output
 *
 * @param {Array} arr - the sound list
 *
 * @return the output array.
 */
function stringifySounds(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].item != null) {
			output.push(arr[i].item);
		} else {
			output.push(arr[i].row.title);
		}
	}
	return output;
}

function parseSounds(arr) {
	var output = [];
	for (var i = 0; i < arr.length; i++) {
		var row = Ti.UI.createTableViewRow();
		if ( typeof arr[i] == "string") {
			row.title = arr[i];
			output.push({
				row : row
			});
		} else {
			row.title = arr[i].title;
			output.push({
				row : row,
				item : arr[i]
			});
		}
	}
	return output;
}

exports.stringifySounds = stringifySounds;
exports.parseSounds = parseSounds;

