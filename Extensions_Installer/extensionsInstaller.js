// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Installer

// Extensions Installer button for Custom Buttons
// (code for "code" section)
// For developers, useful to test restartless extensions.
// Place code to "initialization" section to create a "normal" menu.

// (c) Infocatcher 2013
// version 0.3.0pre - 2013-03-07

var extensions = {
	"extensionsId1@example": {
		name: "Extension 1",
		dir: "d:\\extensions\\my_extension",
		xpi: "%d\\my_extension-latest.xpi"
	},
	"extensionsId2@example": {
		name: "Extension 2",
		dir: "d:\\extensions\\my_extension_2",
		xpi: "%d\\my_extension2-latest.xpi",
		makeExe: "d:\\someMaker.exe",
		makeArgs: ["some", "args", "here"]
	}
};
var _makeExe = "%COMMANDER_PATH%\\utils\\Delayed_Start\\ds.exe";
var _makeArgs = [
	"-w",
	"%d\\make.bat",
	"nodelay"
];

Components.utils.import("resource://gre/modules/AddonManager.jsm");

var mp = document.createElement("menupopup");
mp.setAttribute("oncommand", "this.installExtension(event);");
mp.setAttribute("onpopupshowing", "this.createMenu();");

mp.createMenu = function() {
	mp.setAttribute("onpopupshowing", "this.updateMenu();");

	for(var uid in extensions) if(extensions.hasOwnProperty(uid)) {
		var ext = extensions[uid];
		var mi = document.createElement("menuitem");
		mi.className = "menuitem-iconic";
		mi.setAttribute("cb_uid", uid);
		mi.setAttribute("label", ext.name);
		mi.setAttribute("tooltiptext", ext.dir);
		mi.setAttribute("onmousedown", "this.setAttribute('closemenu', event.shiftKey ? 'none' : 'auto');");
		setStyle(mi, uid);
		mp.appendChild(mi);
	}
};
mp.updateMenu = function() {
	Array.forEach(
		mp.getElementsByTagName("menuitem"),
		function(mi) {
			setStyle(mi, mi.getAttribute("cb_uid"));
		}
	);
};
function setStyle(mi, uid) {
	AddonManager.getAddonByID(uid, function(addon) {
		var icon = addon.iconURL || addon.icon64URL
			|| "chrome://mozapps/skin/extensions/extensionGeneric-16.png";
		mi.setAttribute("image", icon);
		mi.style.color = addon.isActive ? "" : "grayText";
	});
	setTimeout(function() {
		var dir = file(expandVariables(extensions[uid].dir));
		mi.style.textDecoration = dir.exists() ? "" : "line-through";
	}, 0);
}

mp.installExtension = function(e) {
	var mi = e.target;
	var uid = mi.getAttribute("cb_uid");
	if(!uid || !extensions.hasOwnProperty(uid))
		return;
	var ext = extensions[uid];

	var make = !event.ctrlKey && !event.altKey && !event.metaKey;

	var dir = expandVariables(ext.dir);
	function expandDir(s) {
		return s.replace(/^%d/, dir);
	}
	var xpi = expandDir(ext.xpi);
	var makeExe = ext.makeExe || _makeExe;
	var makeArgs = ext.makeArgs || _makeArgs;

	var lockKey = "__extensionsInstaller_" + xpi;
	if(lockKey in window)
		return;
	window[lockKey] = true;
	mi.disabled = true;
	function unlock() {
		setTimeout(function() {
			mi.disabled = false;
			delete window[lockKey];
		}, 300);
	}

	Components.utils.import("resource://gre/modules/Services.jsm");
	if(isCb) {
		if(!btn._extInstallerInProgress++)
			btn._extInstallerOrigImage = btn.image;
		var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
		var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
		if(Services.appinfo.name == "SeaMonkey")
			imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
		var origImg = "_extInstallerOrigImage" in btn ? btn._extInstallerOrigImage : btn.image;
		btn.image = imgConnecting;
		var restore = function() {
			if(!--btn._extInstallerInProgress) {
				btn.image = origImg;
				delete btn._extInstallerOrigImage;
			}
			unlock();
		};
	}
	else {
		var restore = unlock;
		notify("Started…", "Started installation…");
	}

	var xpiFile = file(xpi);
	if(!xpiFile.exists()) {
		restore();
		notify("Error", "File not found:\n" + xpi);
		return;
	}
	xpi = Services.io.newFileURI(xpiFile).spec;

	if(make) try {
		var process = Components.classes["@mozilla.org/process/util;1"]
			.createInstance(Components.interfaces.nsIProcess);
		process.init(file(expandVariables(expandDir(makeExe))));
		process.runw(true, makeArgs.map(expandDir).map(expandVariables), makeArgs.length);
		setTimeout(window.focus, 0); // Strange things happens...
	}
	catch(e) {
		restore();
		notify("Error", "Can't make *.xpi!\n" + e);
		Components.utils.reportError(
			"[Extensions Installer] Can't make *.xpi!\nCommand line:\n"
			+ expandVariables(makeExe) + "\n" + makeArgs.map(expandVariables).join("\n")
		);
		Components.utils.reportError(e);
		return;
	}

	AddonManager.getInstallForURL(
		xpi,
		function(install) {
			if(isCb)
				btn.image = imgLoading;
			install.addListener({
				onInstallEnded: function(install, addon) {
					install.removeListener(this);
					restore();
					notify("Ok!", "Successfully installed:\n" + xpi.match(/[^\\\/]*$/)[0]);
					if(addon.pendingOperations)
						Application.restart();
				},
				onInstallFailed: function(install) {
					install.removeListener(this);
					var err = "Installation failed\n" + xpi;
					Components.utils.reportError(err);
					restore();
					notify("Error", err);
				}
			});
			install.install();
		},
		"application/x-xpinstall"
	);
};

var isCb = this instanceof XULElement; // Custom Buttons
var isCbInit = isCb
	&& typeof event == "object"
	&& !("type" in event)
	&& typeof _phase == "string" && _phase == "init";
if(isCb) {
	var btn = this;
	btn._extInstallerInProgress = 0;
}
if(isCbInit) {
	this.type = "menu";
	this.orient = "horizontal";
	this.appendChild(mp);

	this.onmouseover = function(e) {
		if(e.target != this)
			return;
		Array.some(
			this.parentNode.getElementsByTagName("*"),
			function(node) {
				if(
					node != this
					&& node.namespaceURI == xulns
					&& node.boxObject
					&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
					&& node.open
				) {
					node.open = false;
					this.open = true;
					return true;
				}
				return false;
			},
			this
		);
	};
}
else { // Mouse gestures or something other...
	let e;
	if(typeof event == "object" && event instanceof Event && "screenX" in event) // FireGestures
		e = event;
	else if(this == window && "mgGestureState" in window && "endEvent" in mgGestureState) // Mouse Gestures Redox
		e = mgGestureState.endEvent;
	else {
		let anchor = this instanceof XULElement && this
			|| window.gBrowser && gBrowser.selectedBrowser
			|| document.documentElement;
		if("boxObject" in anchor) {
			let bo = anchor.boxObject;
			e = {
				screenX: bo.screenX,
				screenY: bo.screenY
			};
			if(this instanceof XULElement)
				e.screenY += bo.height;
		}
	}
	if(!e || !("screenX" in e))
		throw new Error("[Extensions Installer]: Can't get event object");
	document.documentElement.appendChild(mp);
	mp.addEventListener("popuphidden", function destroy(e) {
		mp.removeEventListener(e.type, destroy, false);
		setTimeout(function() {
			//mp.destroyMenu();
			mp.parentNode.removeChild(mp);
		}, 0);
	}, false);
	mp.openPopupAtScreen(e.screenX, e.screenY);
}

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