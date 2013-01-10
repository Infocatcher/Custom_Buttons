// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Installer

// Extensions Installer button for Custom Buttons
// (code for "code" section)
// For developers, useful to test restartless extensions

// (c) Infocatcher 2013
// version 0.1.0 - 2013-01-10

var xpi = "file:///d:/my_extension-latest.xpi";

var isCb = this instanceof XULElement;
if(isCb) {
	var btn = this;
	Components.utils.import("resource://gre/modules/Services.jsm");
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