/**
 * a helper with static methods.
 */

Array.prototype.findIndex = function(callback, objectToFind) {
	if (objectToFind) {
		for (var i = 0; i < this.length; i++) {
			if (objectToFind.equals(this[i])) {
				return i;
			}
		}
		return -1;
	} else {
		for (var i = 0; i < this.length; i++) {
			if (callback(this[i])) {
				return i;
			}
		}
		return -1;
	}
};

/**
 * returns an array of length times the value given.
 */
exports.fillArray = function(value, length) {
	var arr = [];
	for (var i = 0; i < length; i++) {
		arr.push(value);
	}
	return arr;
};

/**
 * checks if 2 arrays are equal.
 *
 * @param {array} arr1
 * @param {array} arr2
 *
 * @return true - if arr1=arr2.
 *         false - otherwise.
 */
exports.arrayEqual = function(arr1, arr2) {
	if (arr1.length !== arr2.length)
		return false;
	for (var i = arr1.length; i--; ) {
		if (arr1[i] !== arr2[i])
			return false;
	}

	return true;
};

exports.findLongestWord = function(str) {
	var strSplit = str.split(' ');
	var longestWord = 0;
	for (var i = 0; i < strSplit.length; i++) {
		if (strSplit[i].length > longestWord) {
			longestWord = strSplit[i].length;
		}
	}
	return longestWord;
};

/**
 * deletes an element from its main view
 * @param {Object} element - an element to delete.
 */
exports.removeFromView = function(element) {
	element.setVisible(false);
	element.setHeight(0);
	element.setWidth(0);
	element.setRight(0);
	element.setTop(0);
	element.setBottom(0);
	element.setLeft(0);
};

/**
 * plays the sound of the sent e object.
 *
 * @param {Object} e - object representation of the sound to play.
 *
 * @return - the title of the played sound.
 */
exports.playSound = function(e) {
	var streamer = Alloy.Globals.getStreamer();
	var musicPlayer = Alloy.Globals.getMusicPlayer();
	var row = e.row;
	musicPlayer.stop();
	streamer.stop();
	if (e.item != null) {
		musicPlayer.setQueue(Ti.Media.queryMusicLibrary(e.item)[0]);
		musicPlayer.play();
	} else {
		streamer.setUrl(titleToUrl(row.title));
		setTimeout(streamer.play, 5);
	}
	return row.title;
};

exports.stopAudio = function() {
	Alloy.Globals.shouldVibrate = false;
	var streamer = Alloy.Globals.getStreamer();
	var musicPlayer = Alloy.Globals.getMusicPlayer();
	var soundPlayer = Alloy.Globals.soundPlayer;
	if (Alloy.Globals.stopSoundTimeout != null) {
		clearTimeout(Alloy.Globals.stopSoundTimeout);
	}
	streamer.stop();
	musicPlayer.stop();
	Alloy.Globals.backgroundPlayer.stop();
	Alloy.Globals.setPlaying(null);
	if (soundPlayer != null) {
		soundPlayer.stop();
	}
};

exports.stopRecorder = function() {
	var recorder = Alloy.Globals.getRecorder();
	if (recorder.recording) {
		recorder.stop();
	}
};

function onMusicPlayerStateChange(e) {
	var musicPlayer = Alloy.Globals.getMusicPlayer();
	Ti.API.info("current playback state: " + musicPlayer.playbackState);
	if (musicPlayer.playbackState == 0) {
		Ti.API.info("stopped");
		musicPlayer.skipToNext();
	}
};

/**
 * takes a row title and turns into the location of the corrosponding mp3 file
 *
 * @param title - a string with the title of the table row.
 * @return - the corrosponding url
 */
function titleToUrl(title) {
	title = title.replace(/\s+/g, '_').toLowerCase();
	title = "sounds/" + title + ".mp3";
	return title;
}

function vibrate() {
	if (Alloy.Globals.shouldVibrate) {
		Ti.Media.vibrate();
		setTimeout(vibrate, 1500);
	}
}

exports.vibrate = vibrate;
exports.titleToUrl = titleToUrl;
exports.onMusicPlayerStateChange = function() {
	Ti.API.info("function triggered");
	onMusicPlayerStateChange();
};
