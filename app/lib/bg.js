
var recorder=Titanium.Media.createAudioRecorder();
Ti.Media.audioSessionCategory=Titanium.Media.AUDIO_SESSION_CATEGORY_RECORD;
recorder.start();
Ti.API.info("should start recording background");
setTimeout(recorder.stop,60*1000);
//var s=Alloy.Globals.getRecorder();

