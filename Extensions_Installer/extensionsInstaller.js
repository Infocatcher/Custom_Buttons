// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Installer

// Extensions Installer button for Custom Buttons
// (code for "code" section)
// For developers, useful to test restartless extensions

// (c) Infocatcher 2013
// version 0.2.0 - 2013-01-11

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

Components.utils.import("resource://gre/modules/Services.jsm");
xpi = Services.io.newFileURI(file(xpi)).spec;

var isCb = this instanceof XULElement;
if(isCb) {
	var btn = this;
	var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
	var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
	if(Services.appinfo.name == "SeaMonkey")
		imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
	var origImg = btn.image;
	btn.image = imgConnecting;
}
else {
	notify("Started…", "Started installation…");
}

Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.getInstallForURL(
	xpi,
	function(install) {
		if(make) try {
			var process = Components.classes["@mozilla.org/process/util;1"]
				.createInstance(Components.interfaces.nsIProcess);
			process.init(file(expandVariables(makeExe)));
			process.runw(true, makeArgs.map(expandVariables), makeArgs.length);
		}
		catch(e) {
			btn.image = origImg;
			notify("Error", "Can't make *.xpi!\n" + e);
			Components.utils.reportError(e);
			return;
		}
		if(isCb)
			btn.image = imgLoading;
		install.addListener({
			onInstallEnded: function(install, addon) {
				install.removeListener(this);
				if(isCb)
					btn.image = origImg;
				notify("Ok!", "Successfully installed:\n" + xpi.match(/[^\\\/]*$/)[0]);
				if(addon.pendingOperations)
					Application.restart();
			},
			onInstallFailed: function(install) {
				install.removeListener(this);
				var err = "Installation failed\n" + xpi;
				Components.utils.reportError(err);
				if(isCb)
					btn.image = origImg;
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