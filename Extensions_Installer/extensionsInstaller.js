// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Installer

// Extensions Installer button for Custom Buttons
// (code for "code" section)
// For developers, useful to test restartless extensions

// (c) Infocatcher 2013
// version 0.2.2 - 2013-01-18

var dir = "d:\\my_extension";
var xpi = dir + "\\my_extension-latest.xpi";
var makeExe = "%COMMANDER_PATH%\\utils\\Delayed_Start\\ds.exe";
var makeArgs = [
	"-w",
	dir + "\\make.bat",
	"nodelay"
];
var make = typeof event == "object" && event instanceof Event
	? !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
	: true;

var isCb = this instanceof XULElement;
Components.utils.import("resource://gre/modules/Services.jsm");
if(isCb) {
	var btn = this;
	var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
	var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
	if(Services.appinfo.name == "SeaMonkey")
		imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
	var origImg = btn.image;
	btn.image = imgConnecting;
	btn.disabled = true;
	var restoreBtn = function() {
		btn.image = origImg;
		btn.disabled = false;
	};
}
else {
	notify("Started…", "Started installation…");
}

var xpiFile = file(xpi);
if(!xpiFile.exists()) {
	isCb && restoreBtn();
	notify("Error", "File not found:\n" + xpi);
	return;
}
xpi = Services.io.newFileURI(xpiFile).spec;

if(make) try {
	var process = Components.classes["@mozilla.org/process/util;1"]
		.createInstance(Components.interfaces.nsIProcess);
	process.init(file(expandVariables(makeExe)));
	process.runw(true, makeArgs.map(expandVariables), makeArgs.length);
}
catch(e) {
	isCb && restoreBtn();
	notify("Error", "Can't make *.xpi!\n" + e);
	Components.utils.reportError(e);
	return;
}

Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.getInstallForURL(
	xpi,
	function(install) {
		if(isCb)
			btn.image = imgLoading;
		install.addListener({
			onInstallEnded: function(install, addon) {
				install.removeListener(this);
				isCb && restoreBtn();
				notify("Ok!", "Successfully installed:\n" + xpi.match(/[^\\\/]*$/)[0]);
				if(addon.pendingOperations)
					Application.restart();
			},
			onInstallFailed: function(install) {
				install.removeListener(this);
				var err = "Installation failed\n" + xpi;
				Components.utils.reportError(err);
				isCb && restoreBtn();
				notify("Error", err);
			}
		});
		install.install();
	},
	"application/x-xpinstall"
);
function notify(title, text) {
	Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService)
		.showAlertNotification(
			"chrome://mozapps/skin/extensions/extensionGeneric.png",
			"Extensions Installer: " + title,
			text
		);
}
function expandVariables(str) {
	var props = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties);
	var env = Components.classes["@mozilla.org/process/environment;1"]
		.getService(Components.interfaces.nsIEnvironment);
	return str.replace(/%([^%]+)%/g, function(s, alias) {
		try {
			return props.get(alias, Components.interfaces.nsIFile).path;
		}
		catch(e) {
		}
		if(env.exists(alias))
			return env.get(alias);
		return s;
	});
}
function file(path) {
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile || Components.interfaces.nsIFile);
	file.initWithPath(path);
	return file;
}