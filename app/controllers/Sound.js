/**
 * handles the music picking in the app.
 *
 *
 * the items in "selectedRows" and "songList" arrays are of kind
 * {row : Ti.UI.tableViewRow, item: Titanium.media.item}.
 * "selectedRows" - represents the rows (and items) which the user chose.
 * "songList" - represents the songs that are currently in the users "songs" table
 * (all of them have the item property).
 * only rows which represent songs have the "item" property.
 *
 *
 * ASSUMPTIONS: the "songList" item in index i is corrosponding
 * to the "songs" table row in index i.
 *
 *
 * HOW CHOOSING TONES WORKS:
 * you can choose between one tone or many using the shuffle switch.
 * in shuffle: you can choose multiple sounds by clicking them.
 * 			   if they are already choosen it will unchoose (or just stop playing them if playing).
 * not in shuffle: you choose one song and clicking it when checked doesn't change anything.
 * how none works: when you choose none in whatever mode you are in the user's selections are cleared
 *                 and none is checked.
 *
 */

var args = $.args;
var isEdit = args.isEdit;
var isLocation = Boolean(args.isLocation);
var dispatcher = require("dispatcher");
var Helper = require("Helper");

var selectedRows = [];
var shuffle = false;

var streamer = Alloy.Globals.getStreamer();
var musicPlayer = Alloy.Globals.getMusicPlayer();

var songList = [];
var lastPlayed;

/**
 * shuffle is true so it wont play the music in "createRowAndInsert".
 */
function initialize() {
	//if (!(args.sounds instanceof Array) || typeof (args.shuffle) != "boolean")
	//throw "args are not right types";
	var sounds = args.sounds;
	shuffle = true;
	for (var i = 0; i < sounds.length; i++) {
		if (sounds[i].item != null) {
			createRowAndInsert(sounds[i].item);
		} else {
			var indexOfRow = $.tones.data[0].rows.findIndex(function(other) {
				if (sounds[i].row.title == other.title) {
					return true;
				}
				return false;
			});
			selectedRows.push({
				row : $.tones.data[0].rows[indexOfRow]
			});
			$.tones.data[0].rows[indexOfRow].setHasCheck(true);
		}
	}
	if (sounds.length == 0) {
		$.none.setHasCheck(true);
	}
	shuffle = args.shuffle;
	$.s.setValue(shuffle);
	initView();
}

/**
 * if the user is choosing a location makes the sounds default only.
 * (no choosing from music library).
 */
function initView() {
	if (isLocation) {
		Helper.removeFromView($.shuffleTable);
		Helper.removeFromView($.explainShuffle);
		Helper.removeFromView($.songs);
		Helper.removeFromView($.noneTable);
		$.tones.setBottom(40);
	}
}

if (args.sounds != null && args.shuffle != null) {
	initialize();
}

/**
 * takes a row title and turns into the location of the corrosponding mp3 file
 *
 * @param title - a string with the title of the table row.
 * @return - the corrosponding url
 */
function titleToUrl(title) {
	return Helper.titleToUrl(title);
}

/**
 * cleans all checks from the "selectedRows" array and removes them.
 * the row with given title is not unchecked but it is removed.
 *
 * @param title - string with a title to not delete.
 */
function clean(title) {
	while (selectedRows.length > 0) {
		var r = selectedRows.pop();
		if (r.row.title != title) {
			r.row.setHasCheck(false);
		}
	}
}

/**
 * a function that is triggerd when the user presses the shuffle switch
 * and updates the shuffle variable.
 *
 * HOW IT WORKS:
 * 1.changes the shuffle var's value to the new val.
 * 2.deletes all the checks from the rows and removes them from the "selectedRows" array except from the last one.
 */
function onShuffle(e) {
	shuffle = e.value;
	var row;
	while (selectedRows.length >= 1) {
		row = selectedRows.shift();
		row.row.setHasCheck(false);
	}
	if (row != null) {
		selectedRows.push(row);
		row.row.setHasCheck(true);
	}
}

/**
 * fired when tone table is clicked and adjusts the "selectedRows" array.
 * turns e into the ussual object in this file ({item:,row:}) and handles the tone choosing using
 * the "toneIfNotShuffle" and "toneIfShuffle" functions.
 * @param {Object} e
 */
function chooseTone(e) {
	e = {
		row : e.row
	};
	$.none.setHasCheck(false);
	if (shuffle == false) {
		toneIfNotShuffle(e);
	} else {
		toneIfShuffle(e);
	}
}

/**
 * chooses the tone when in shuffle mode.
 *
 * @param e - an object with properties item and row.
 *
 * HOW IT WORKS:
 * 1. removes e object from "selectedRows" array using "removeFromSelectedRows".
 * 2. if the sound the row is representing is playing stops the music and pushes it back in.
 * 3. else if e is checked but not playing will uncheck the row.
 * 4. if (2) and (3) are not true it will put it back in check it and play it.
 */
function toneIfShuffle(e) {
	removeFromSelectedRows(e);
	//1 is the musicPlayer playbackState when playing.
	if ((streamer.getPlaying() || musicPlayer.playbackState == 1)//
	&& lastPlayed == e.row.title) {
		musicPlayer.stop();
		streamer.stop();
		selectedRows.push(e);
	} else if (e.row.getHasCheck() && (lastPlayed != e.row.title || //
	(!streamer.getPlaying() && musicPlayer.playbackState != 1))) {
		e.row.setHasCheck(false);
	} else {
		selectedRows.push(e);
		e.row.setHasCheck(true);
		playSound(e);
	}
}

/**
 * sets the tone when not in shuffle mode.
 *
 * @param e - an object with properties item and row.
 *
 * HOW IT WORKS:
 * 1. cleans "selectedRows" array except from e.row.title using the "clean" function. checks e.
 * 2. if e is playing stops it and if not plays it using the "playSound" function.
 * 3. pushes e back into "selectedRows" (since it has been removed by the "clean" function at (1)).
 */
function toneIfNotShuffle(e) {
	clean(e.row.title);
	e.row.setHasCheck(true);
	if ((streamer.getPlaying() || musicPlayer.playbackState == 1 )//
	&& lastPlayed == e.row.title) {
		streamer.stop();
		musicPlayer.stop();
	} else {
		playSound(e);
	}
	selectedRows.push(e);
}

/**
 * plays the sound of the sent e object.
 *
 * @param {Object} e - object representation of the sound to play.
 */
function playSound(e) {
	lastPlayed = Helper.playSound(e);
}

/**
 * removes a certain row from the "selectedRows" array.
 *
 * @param {Object} e - object representing the row to remove.
 */
function removeFromSelectedRows(e) {
	var indexOfRow = selectedRows.findIndex(function(other) {
		if (e.row.title == other.row.title) {
			return true;
		}
		return false;
	});
	if (indexOfRow >= 0) {
		selectedRows.splice(indexOfRow, 1);
	}
}

/**
 * function that is triggerd when the user clicks a row in the "songs" table.
 * uses the index property of the e object to know which corrosponding songList item to send
 * to the corrosponding functions.
 *
 * @param {Object} e - table click event object.
 */
function chooseSong(e) {
	$.none.setHasCheck(false);
	if (shuffle) {
		toneIfShuffle(songList[e.index]);
	} else {
		toneIfNotShuffle(songList[e.index]);
	}
}

/**
 * triggerd when the user clicks on the "Pick Songs" row.
 * basically opens the user's music library.
 */
function selectMusic() {
	streamer.stop();
	musicPlayer.stop();
	Ti.Media.openMusicLibrary({
		autohide : false,
		animated : true,
		allowMultipleSelections : shuffle,
		success : function(e) {
			onMusicSuccess(e);
		},
	});
}

/**
 * called when the user successfuly finished choosing his music.
 *
 * @param e - a music success event object.
 *
 * HOW IT WORKS:
 * 1. if shuffle is off cleans "songList" array and the "songs" table.
 * 2. turns the media items into regular objects using "createMyItems()".
 * 3. clean the items the user selected from duplicates using "cleanItems()"
 * 4. clearing items which are already in "songList" array from items using "clearDuplicates()".
 * 5. creates a new row in the songs table and inserts to "songList" each one of the items
 *    choosen by the users using "createRowAndInsert()".
 * 6. hides the music library.
 */
function onMusicSuccess(e) {
	if (shuffle == false) {
		songList = [];
		clearTable($.songs, $.songs.data[0].rows.length - 1);
	}
	var items = createMyItems(e.items);
	items = cleanItems(items);
	clearDuplicates(items);
	for (var i = items.length - 1; i >= 0; i--) {
		createRowAndInsert(items[i]);
	}
	if (shuffle && items.length == 1) {
		playSound(songList[0]);
	}
	Ti.Media.hideMusicLibrary();
}

/**
 * creates a table row from "MediaItem" object and inserts it to the "songs" table.
 *
 * @ item - a MediaItem object to do it with.
 *
 * HOW IT WORKS:
 * 1. creates a row with title and a check mark.
 * 2. inserts the row to "$.songs" table at index 0.
 * 3. renew the click event listener for the table.
 * 4. create new object with properties row and item.
 * 5. insert them at the begining of the "songList" array.
 * 6. if shuffle is on pushes it to the "selectedRows" array. doesn't play it just puts it in.
 * 7. if not sets obj's index to 0 (like its index in "songList" array) and calls "chooseSong".
 */
function createRowAndInsert(item) {
	var row = $.UI.create("TableViewRow", {
		title : item.title,
		hasCheck : true,
	});
	$.songs.insertRowBefore(0, row);
	$.songs.addEventListener("click", chooseSong);
	var obj = {
		row : row,
		item : item
	};
	songList.unshift(obj);
	if (shuffle) {
		selectedRows.push(obj);
	} else {
		obj.index = 0;
		chooseSong(obj);
	}
}

/**
 * gets a table to delete all rows from up until a certain index.
 *
 * @param {TableView} table - table to delete rows from.
 * @param {Integer} index - index to stop deleting.
 */
function clearTable(table, index) {
	for (var i = 0; i < index; i++) {
		table.deleteRow(0);
	}
}

/**
 * recieves a media item array and removes items that show up more than once.
 *
 * @param { MediaItem[] } items - a list of media items to clean.
 * @return the clean items array.
 */
function cleanItems(items) {
	var index = 0;
	while (index < items.length) {
		for (var i = index + 1; i < items.length; i++) {
			if (items[index].title == items[i].title) {
				items.splice(i, 1);
				i--;
			}
		}
		index++;
	}
	return items;
}

/**
 * recieves a media items array and cleans things from the items that show up in the "songs" table.
 *
 * @param { MediaItem[] } items - item list to clean from.
 */
function clearDuplicates(items) {
	var index = 0;
	while (index < songList.length) {
		var t = songList[0].item.title;
		for (var i = 0; i < items.length; i++) {
			if (t == items[i].title) {
				songList.splice(index, 1);
				$.songs.deleteRow(index);
				index--;
			}
		}
		index++;
	}
}

/**
 * fired when the user clicks the "None" option.
 *
 * HOW IT WORKS:
 * 1. stops all music and cleans "selectedRows" using the "clean()" function.
 * 2. checks or unchecks the "None" row.
 */
function onNone() {
	var check = $.none.getHasCheck();
	musicPlayer.stop();
	streamer.stop();
	$.none.setHasCheck(true);
	clean("");
}

function end() {
	musicPlayer.stop();
	streamer.stop();
	Titanium.Media.hideMusicLibrary();
	if (selectedRows.length <= 1) {
		shuffle = false;
	}
	dispatcher.trigger("setSound", {
		sounds : selectedRows,
		shuffle : shuffle
	});
	//"setSound" is triggerd in the "addAlarm" controller.
	args.win.closeWindow($.w);
}

function cancel() {
	dispatcher.off("setSound");
	musicPlayer.stop();
	streamer.stop();
	args.win.closeWindow($.w);
}

exports.defaultSound = $.tones.data[0].rows[0];

function addListeners() {
	dispatcher.trigger("addListeners");
}

/**
 * takes a list of "Ti.Media.Item" and turns them into regular objects
 * containing the properties: title, artist, composer.
 */
function createMyItems(items) {
	var myItems = [];
	for (var i = 0; i < items.length; i++) {
		myItems.push({
			title : items[i].title,
			artist : items[i].artist,
			composer : items[i].composer,
		});
	}
	return myItems;
}

/*function print(array) {
 var arr = [];
 for (var i = 0; i < array.length; i++) {
 arr.push(array[i].row.title);
 }
 Ti.API.info(arr);
 }*/
