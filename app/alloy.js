// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// added during app creation. this will automatically login to
// ACS for your application and then fire an event (see below)
// when connected or errored. if you do not use ACS in your
// application as a client, you should remove this block
(function() {
	var ACS = require('ti.cloud'),
	    env = Ti.App.deployType.toLowerCase() === 'production' ? 'production' : 'development',
	    username = Ti.App.Properties.getString('acs-username-' + env),
	    password = Ti.App.Properties.getString('acs-password-' + env);

	// if not configured, just return
	if (!env || !username || !password) {
		return;
	}
	/**
	 * Appcelerator Cloud (ACS) Admin User Login Logic
	 *
	 * fires login.success with the user as argument on success
	 * fires login.failed with the result as argument on error
	 */
	ACS.Users.login({
		login : username,
		password : password,
	}, function(result) {
		if (env === 'development') {
			Ti.API.info('ACS Login Results for environment `' + env + '`:');
			Ti.API.info(result);
		}
		if (result && result.success && result.users && result.users.length) {
			Ti.App.fireEvent('login.success', result.users[0], env);
		} else {
			Ti.App.fireEvent('login.failed', result, env);
		}
	});

	var recorder,
	    streamer,
	    musicPlayer;

	Alloy.Globals.backgroundColor = "#E4E7EE";
	//rgb(227,229,235);
	Alloy.Globals.tintColor = "rgb(245,32,24)";
	//rgb(255,0,55)
	Alloy.Globals.fontColor = "rgb(141,140,146)";
	//"rgb(142,142,147)";
	Alloy.Globals.edgesColor = "rgb(244,244,250)";
	//"rgb(238,238,243)";//rgb(243,243,245),

	Alloy.Globals.width = (Ti.Platform.displayCaps.platformWidth) / 2 - 0.5;
	Alloy.Globals.height = (Ti.Platform.displayCaps.platformWidth) / 2;
	Alloy.Globals.borderDim = (Ti.Platform.displayCaps.platformWidth) / 2 - 24;
	Alloy.Globals.defaultSound = {
		row : Ti.UI.createTableViewRow({
			title : "Apex"
		}),
	};

	/**
	 * returns the global audio streamer of the app.
	 * if it does not exist yet: create it.
	 */
	Alloy.Globals.getStreamer = function() {
		if (streamer == null) {
			streamer = Titanium.Media.createAudioPlayer();
		}
		return streamer;
	};

	/**
	 * returns the global music-player of the app.
	 * if it does not exist yet: create it.
	 */
	Alloy.Globals.getMusicPlayer = function() {
		if (musicPlayer == null) {
			musicPlayer = Ti.Media.systemMusicPlayer;
		}
		return musicPlayer;
	};

	/**
	 * returns the global audio recorder of the app.
	 * if it does not exist yet: create it.
	 */
	Alloy.Globals.getRecorder = function() {
		if (recorder == null) {
			recorder = Titanium.Media.createAudioRecorder();
		}
		return recorder;
	};

	Alloy.Globals.soundPlayer = Ti.Media.createSound({
		url : "sounds/apex.mp3",
		looping : true,
	});

	Alloy.Globals.backgroundPlayer = Ti.Media.createSound({
		url : "sounds/apex.mp3",
		looping : true,
		volume : 0.0,
	});

	//a variable to tell you if you are in the app or not.
	Alloy.Globals.inApp = true;

	//the timeout object which stops the sound.
	Alloy.Globals.stopSoundTimeout = null;

	Alloy.Globals.shouldVibrate = false;

	/**
	 * true iff the app is playing a sound in the background.
	 */
	Alloy.Globals.isPlaying = false;

	Alloy.Globals.nowPlaying = null;

	Alloy.Globals.setPlaying = function(alarm) {
		Alloy.Globals.nowPlaying = alarm;
		if (alarm != null) {
			Alloy.Globals.isPlaying = true;
		} else {
			Alloy.Globals.isPlaying = false;
		}
	};

	Ti.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;
})();

