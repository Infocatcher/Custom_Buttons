// https://github.com/Infocatcher/Custom_Buttons/tree/master/Extensions_Installer

// Extensions Installer button for Custom Buttons
// (code for "code" section)
// For developers, useful to test restartless extensions.
// Place code to "initialization" section to create a "normal" menu.

// (c) Infocatcher 2013-2014
// version 0.3.0pre6 - 2014-02-18

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
	"-k999",
	"%d\\make.bat",
	"nodelay"
];

if(!("AddonManager" in window))
	Components.utils.import("resource://gre/modules/AddonManager.jsm");

var mp = document.createElement("menupopup");
mp.setAttribute("oncommand", "this.installExtension(event);");
mp.setAttribute("onpopupshowing", "this.createMenu();");
mp.setAttribute("onmousedown", "event.target.setAttribute('closemenu', event.shiftKey ? 'none' : 'auto');");
mp.setAttribute("onclick", "this.handleClick(event);");

mp.createMenu = function() {
	mp.setAttribute("onpopupshowing", "this.updateMenu();");

	for(var uid in extensions) if(extensions.hasOwnProperty(uid)) {
		var ext = extensions[uid];
		var mi = document.createElement("menuitem");
		mi.className = "menuitem-iconic";
		mi.setAttribute("cb_uid", uid);
		mi.setAttribute("label", ext.name);
		mi.setAttribute("tooltiptext", ext.dir);
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
mp.handleClick = function(e) {
	if(e.button == 0 || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey)
		return;
	if(e.button == 1)
		this.toggleExtension(e.target);
	else if(e.button == 2) {
		e.preventDefault();
		this.openExtensionOptions(e.target);
	}
};
mp.toggleExtension = function(mi) {
	var uid = mi.getAttribute("cb_uid");
	if(!uid)
		return;
	AddonManager.getAddonByID(uid, function(addon) {
		if(addon) {
			addon.userDisabled = !addon.userDisabled;
			setStyle(mi, uid, addon);
		}
	});
};
mp.openExtensionOptions = function(mi) {
	var uid = mi.getAttribute("cb_uid");
	if(!uid)
		return;
	AddonManager.getAddonByID(uid, function(addon) {
		if(addon && openAddonOptions(addon))
			mi.parentNode.hidePopup();
	});
};
function openAddonOptions(addon) {
	// Based on code from chrome://mozapps/content/extensions/extensions.js
	// Firefox 21.0a1 (2013-01-27)
	Components.utils.import("resource://gre/modules/Services.jsm");
	var optionsURL = addon.optionsURL;
	if(!addon.isActive || !optionsURL)
		return false;
	if(addon.type == "plugin") // No options for now!
		return false;
	if(addon.optionsType == AddonManager.OPTIONS_TYPE_INLINE)
		openAddonPage(addon, true);
	else if(addon.optionsType == AddonManager.OPTIONS_TYPE_TAB && "switchToTabHavingURI" in window)
		switchToTabHavingURI(optionsURL, true);
	else {
		let windows = Services.wm.getEnumerator(null);
		while(windows.hasMoreElements()) {
			let win = windows.getNext();
			if(win.document.documentURI == optionsURL) {
				win.focus();
				return true;
			}
		}
		// Note: original code checks browser.preferences.instantApply and may open modal windows
		window.openDialog(optionsURL, "", "chrome,titlebar,toolbar,centerscreen,dialog=no");
	}
	return true;
}
function openAddonsManager(view) {
	var openAddonsMgr = window.BrowserOpenAddonsMgr // Firefox
		|| window.openAddonsMgr // Thunderbird
		|| window.toEM; // SeaMonkey
	openAddonsMgr(view);
}
function openAddonPage(addon, scrollToPreferences) {
	scrollToPreferences = scrollToPreferences && parseFloat(Services.appinfo.platformVersion) >= 12
		? "/preferences"
		: "";
	openAddonsManager("addons://detail/" + encodeURIComponent(addon.id) + scrollToPreferences);
}
function setStyle(mi, uid, addon) {
	function getAddonCallback(addon) {
		var icon = "";
		var color = "grayText";
		var iconOpacity = "0.5";
		if(addon) {
			icon = addon.iconURL
				|| addon.icon64URL
				|| "chrome://mozapps/skin/extensions/extensionGeneric-16.png";
			if(addon.isActive)
				color = iconOpacity = "";
		}
		mi.setAttribute("image", icon);
		mi.style.color = color;
		var icon = mi.ownerDocument.getAnonymousElementByAttribute(mi, "class", "menu-iconic-icon");
		if(icon)
			icon.style.opacity = iconOpacity;
	}
	if(addon !== undefined)
		getAddonCallback(addon);
	else
		AddonManager.getAddonByID(uid, getAddonCallback);
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
		var progressIcon = new ProgressIcon(btn);
		var restore = function() {
			unlock();
			progressIcon.restore();
		};
	}
	else {
		var restore = unlock;
		notify("Started…", "Started installation…");
	}

	var xpiFile = file(xpi);

	if(make) try {
		var process = Components.classes["@mozilla.org/process/util;1"]
			.createInstance(Components.interfaces.nsIProcess);
		process.init(file(expandVariables(expandDir(makeExe))));
		//var t = Date.now();
		process.runw(true, makeArgs.map(expandDir).map(expandVariables), makeArgs.length);
		//LOG("[Extensions Installer] process.runw() done in " + (Date.now() - t) + "ms");
		setTimeout(window.focus, 0); // Strange things happens...
	}
	catch(e) {
		restore();
		error("Error", "Can't make *.xpi!\n" + e);
		Components.utils.reportError(
			"[Extensions Installer] Can't make *.xpi!\nCommand line:\n"
			+ expandVariables(makeExe) + "\n" + makeArgs.map(expandVariables).join("\n")
		);
		Components.utils.reportError(e);
		return;
	}

	if(!xpiFile.exists()) {
		restore();
		error("Error", "File not found:\n" + xpi);
		return;
	}

	AddonManager.getInstallForFile(
		xpiFile,
		function(install) {
			if(progressIcon)
				progressIcon.loading();
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
					error("Error", err);
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
var btn = isCb && this;
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

function notify(title, text, isError) {
	Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService)
		.showAlertNotification(
			isError
				? "chrome://global/skin/icons/Warning.png"
				: /*btn && btn.image || */"chrome://mozapps/skin/extensions/extensionGeneric.png",
			"Extensions Installer: " + title,
			text
		);
}
function error(title, text) {
	notify(title, text, true);
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
function ProgressIcon(btn) {
	var app = Services.appinfo.name;
	if(app == "SeaMonkey")
		this.imgConnecting = this.imgLoading = "chrome://communicator/skin/icons/loading.gif";
	else if(app == "Thunderbird") {
		this.imgConnecting = "chrome://messenger/skin/icons/connecting.png";
		this.imgLoading = "chrome://messenger/skin/icons/loading.png";
	}
	else {
		this.imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
		this.imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
	}
	if(!(btn instanceof XULElement)) {
		this.loading = this.restore = function() {};
		return this;
	}
	var useAnimation = app == "Firefox" && parseFloat(Services.appinfo.platformVersion) >= 32;
	var btnIcon = btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
	var origIcon = btnIcon.src;
	btnIcon.src = this.imgConnecting;
	if(useAnimation) {
		let cs = btnIcon.ownerDocument.defaultView.getComputedStyle(btnIcon, null);
		let s = btnIcon.style;
		s.margin = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(" ");
		s.padding = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(" ");
		s.width = cs.width;
		s.height = cs.height;
		s.boxShadow = "none";
		s.borderColor = s.background = "transparent";
		btnIcon.setAttribute("fadein", "true");
		btnIcon.setAttribute("busy", "true");
		btnIcon.classList.add("tab-throbber");
		btnIcon._restore = function() {
			delete btnIcon._restore;
			btnIcon.removeAttribute("busy");
			btnIcon.removeAttribute("progress");
			setTimeout(function() {
				btnIcon.classList.remove("tab-throbber");
				btnIcon.removeAttribute("style");
				btnIcon.removeAttribute("fadein");
			}, 0);
		};
	}
	this.loading = function() {
		btnIcon.src = this.imgLoading;
		if(useAnimation)
			btnIcon.setAttribute("progress", "true");
	};
	this.restore = function() {
		btnIcon.src = origIcon;
		if(useAnimation)
			btnIcon._restore();
	};
	return this;
}