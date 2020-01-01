// http://infocatcher.ucoz.net/js/cb/toggleRestartlessAddons.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57948
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Toggle_Restartless_Add-ons

// Toggle Restartless Add-ons button for Custom Buttons
// (code for "initialization" section)
// Also the code can be used from main window context (as Mouse Gestures code, for example)

// Also you can check for add-ons updates using right-click:
// copy all code from
// https://github.com/Infocatcher/Custom_Buttons/blob/master/Check_for_Addons_Updates/checkForAddonsUpdates.js
// after "//== Check for Addons Updates begin"

// See "var style = " to modify styles for specific add-ons

// (c) Infocatcher 2013-2019
// version 0.1.3pre4 - 2020-01-01

var options = {
	addonTypes: ["extension", "plugin"],
	// Possible values: "extension", "plugin"
	// From extensions: "userstyle" (Stylish), "greasemonkey-user-script" (Greasemonkey), "userscript" (Scriptish)
	// (swap to reorder in the menu)
	showVersions: 0,
	// 0 - don't show versions
	// 1 - show after name: "Addon Name 1.2"
	// 2 - show as "acceltext" (in place for hotkey text)
	showHidden: 1,
	// 0  - don't show hidden add-ons
	// -1 - show only enabled hidden add-ons (e.g. to track new items)
	// 1  - show all hidden add-ons
	sort: {
		enabled:     0,
		clickToPlay: 0,
		disabled:    0
		// Sort order:
		// 0, 0, 0 - sort add-ons of each type alphabetically
		// 0, 0, 1 - show enabled add-ons (of each type) first
		// 0, 1, 2 - enabled add-ons, then click-to-play and then disabled
	},
	closeMenu: false, // Close menu after left-click
	closeMenuClickToPlay: false // Close menu after left-click, for click to play plugins
	// Use Shift+click to invert closeMenu* behavior
};

var xulns = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var mp = document.createElementNS(xulns, "menupopup");
mp.setAttribute("onpopupshowing", "this.updateMenu();");
mp.setAttribute("oncommand", "this.handleEvent(event);");
mp.setAttribute("onmousedown", "if(event.button == 0) this.handleEvent(event);");
mp.setAttribute("onclick", "if(event.button > 0) this.handleEvent(event);");
mp.setAttribute("oncontextmenu", "return false;");
mp.setAttribute("onpopuphidden", "this.destroyMenu();");

var tb = this.parentNode;
if(tb && tb.getAttribute("orient") == "vertical") {
	// https://addons.mozilla.org/firefox/addon/vertical-toolbar/
	var isRight = tb.parentNode.getAttribute("placement") == "right";
	mp.setAttribute("position", isRight ? "start_before" : "end_before");
}

var cleanupTimer = 0;
mp.updateMenu = function() {
	clearTimeout(cleanupTimer);
	addStyle();
	getRestartlessAddons(options.addonTypes, function(addons) {
		var df = document.createDocumentFragment();
		var prevType;
		function sortPosition(addon) {
			if("STATE_ASK_TO_ACTIVATE" in AddonManager && addon.userDisabled == AddonManager.STATE_ASK_TO_ACTIVATE)
				return options.sort.clickToPlay;
			if(addon.isActive)
				return options.sort.enabled;
			return options.sort.disabled;
		}
		function key(addon) {
			return options.addonTypes.indexOf(addon.type)
				+ "\n" + sortPosition(addon)
				+ "\n" + addon.name.toLowerCase();
		}
		addons.sort(function(a, b) {
			var ka = key(a);
			var kb = key(b);
			return ka == kb ? 0 : ka < kb ? -1 : 1;
		}).forEach(function(addon) {
			var type = addon.type;
			if(prevType && type != prevType)
				df.appendChild(document.createElementNS(xulns, "menuseparator"));
			prevType = type;
			var icon = addon.iconURL || addon.icon64URL;
			var mi = document.createElementNS(xulns, "menuitem");
			mi.className = "menuitem-iconic";
			var label = addon.name;
			if(options.showVersions == 1)
				label += " " + addon.version;
			else if(options.showVersions == 2)
				mi.setAttribute("acceltext", addon.version);
			mi.setAttribute("label", label);
			mi.setAttribute("image", icon || mp.icons[type] || "");
			if(!icon && mp.icons.useSVG)
				mi.style.fill = "#15c";
			var tip = addon.description || "";
			var delay = "delayedStartupAddons" in Services
				&& Services.delayedStartupAddons[addon.id] || null;
			var isDelayed = delay !== null;
			mi.classList.toggle("toggleRestartlessAddons-isDelayed", isDelayed);
			if(isDelayed)
				tip = "[Delayed Startup: " + delay.toLocaleString() + "]" + (tip ? "\n" + tip : "");
			tip && mi.setAttribute("tooltiptext", tip);
			mi.classList.toggle("toggleRestartlessAddons-isHidden", addon.hidden || false);
			setDisabled(mi, addon.userDisabled);
			mi._cbAddon = addon;
			df.appendChild(mi);
		});
		mp.textContent = "";
		mp.appendChild(df);
	});
};
mp.handleEvent = function(e) {
	var mi = e.target;
	if(!("_cbAddon" in mi))
		return;
	var addon = mi._cbAddon;
	if(e.type == "mousedown") {
		var closeMenu = isAskToActivateAddon(addon)
			? options.closeMenuClickToPlay
			: options.closeMenu;
		if(e.shiftKey)
			closeMenu = !closeMenu;
		mi.setAttribute("closemenu", closeMenu ? "auto" : "none");
		return;
	}
	var hasMdf = hasModifier(e);
	if(e.type == "command" && (!hasMdf || e.shiftKey)) {
		let newDis = setNewDisabled(addon);
		setDisabled(mi, newDis);
	}
	else if(e.type == "command" && hasMdf || e.type == "click" && e.button == 1) {
		openAddonPage(addon);
		closeMenus(mi);
	}
	else if(e.type == "click" && e.button == 2) {
		if(openAddonOptions(addon))
			closeMenus(mi);
	}
};
mp.destroyMenu = function() {
	removeStyle();
	clearTimeout(cleanupTimer);
	cleanupTimer = setTimeout(function() {
		mp.textContent = "";
	}, 5000);
};
mp.icons = {
	get platformVersion() {
		delete this.platformVersion;
		return this.platformVersion = parseFloat(Services.appinfo.platformVersion);
	},
	get useSVG() {
		delete this.useSVG;
		return this.useSVG = Services.appinfo.name == "Firefox" && this.platformVersion >= 57;
	},
	get plugin() {
		delete this.plugin;
		return this.plugin = this.useSVG
			? this.platformVersion >= 65
				? "chrome://global/skin/plugins/pluginGeneric.svg"
				: "chrome://mozapps/skin/plugins/pluginGeneric.svg"
			: "chrome://mozapps/skin/plugins/pluginGeneric-16.png";
	},
	get extension() {
		delete this.extension;
		return this.extension = this.useSVG
			? "chrome://mozapps/skin/extensions/extensionGeneric-16.svg"
			: "chrome://mozapps/skin/extensions/extensionGeneric-16.png";
	}
};
function isAskToActivateAddon(addon) {
	return addon.type == "plugin"
		&& "STATE_ASK_TO_ACTIVATE" in AddonManager
		&& Services.prefs.getBoolPref("plugins.click_to_play");
}
function setNewDisabled(addon) {
	var newDis = getNewDisabled(addon);
	var oldDis = addon.userDisabled;
	try {
		addon.userDisabled = newDis;
	}
	catch(e) { // Error: Cannot disable hidden add-on firefox@getpocket.com
		_log("Can't set addon.userDisabled to " + newDis + ", error:\n" + e);
		if(addon.hidden)
			setNewDisabledRaw(addon, newDis);
	}
	var realDis = addon.userDisabled;
	if(realDis != newDis && addon.type == "extension") { // Firefox 62+? Weird things happens
		setNewDisabledRaw(addon, newDis);
		realDis = addon.userDisabled;
	}
	if(realDis != newDis) { // We can't enable vulnerable plugins
		let err = "Can't set addon.userDisabled to " + newDis + ", real value: " + realDis;
		if(newDis) {
			_log(err + "\nSTATE_ASK_TO_ACTIVATE not supported?");
			newDis = false;
		}
		else {
			_log(err + "\nVulnerable plugin?");
			if(oldDis == AddonManager.STATE_ASK_TO_ACTIVATE)
				newDis = true;
			else
				newDis = AddonManager.STATE_ASK_TO_ACTIVATE;
		}
		addon.userDisabled = newDis;
	}
	return addon.userDisabled;
}
function getNewDisabled(addon) {
	// disabled -> STATE_ASK_TO_ACTIVATE -> enabled -> ...
	var curDis = addon.userDisabled;
	var newDis;
	if("STATE_ASK_TO_ACTIVATE" in AddonManager && curDis == AddonManager.STATE_ASK_TO_ACTIVATE)
		newDis = false;
	else if(!curDis)
		newDis = true;
	else {
		if(isAskToActivateAddon(addon))
			newDis = AddonManager.STATE_ASK_TO_ACTIVATE;
		else
			newDis = false;
	}
	return newDis;
}
function setNewDisabledRaw(addon, newDis) {
	_log("Let's try set addon.userDisabled using raw hack");
	let g = Components.utils.import("resource://gre/modules/addons/XPIProvider.jsm", {});
	if("XPIDatabase" in g && "updateAddonDisabledState" in g.XPIDatabase) { // Firefox 61+
		let rawAddon = g.XPIDatabase.getAddons().find(function(rawAddon) {
			return rawAddon.id == addon.id;
		});
		g.XPIDatabase.updateAddonDisabledState(rawAddon, newDis);
	}
	else if("eval" in g) { // See "set userDisabled(val)"
		let addonFor = g.eval("addonFor");
		let rawAddon = addonFor(addon);
		//rawAddon.userDisabled = newDis;
		g.XPIProvider.updateAddonDisabledState(rawAddon, newDis);
	}
	else { // Firefox 57+? See https://forum.mozilla-russia.org/viewtopic.php?pid=745272#p745272
		updateAddonDisabledState(addon, newDis);
	}
}
function updateAddonDisabledState(addon, newDis) {
	var nsvo = Components.utils.import("resource://gre/modules/addons/XPIProvider.jsm", {});
	var key = "_cbToggleRestartlessAddonsData";
	var url = URL.createObjectURL(new Blob([
		"XPIProvider.updateAddonDisabledState(addonFor(this." + key + "[0]), this." + key + "[1]); delete this." + key + ";"
	]));
	addDestructor(function() {
		URL.revokeObjectURL(url);
	});
	(updateAddonDisabledState = function(addon, newDis) {
		nsvo[key] = [addon, newDis];
		Services.scriptloader.loadSubScript(url, nsvo);
	})(addon, newDis);
}
function setDisabled(mi, disabled) {
	var askToActivate = "STATE_ASK_TO_ACTIVATE" in AddonManager && disabled == AddonManager.STATE_ASK_TO_ACTIVATE;
	var cl = mi.classList;
	cl.toggle("toggleRestartlessAddons-askToActivate", askToActivate);
	cl.toggle("toggleRestartlessAddons-disabled", disabled && !askToActivate);
}

if(
	this instanceof XULElement // Custom Buttons
	&& typeof event == "object"
	&& !("type" in event) && typeof _phase == "string" && _phase == "init" // Initialization
) {
	this.type = "menu";
	this.orient = "horizontal";
	this.appendChild(mp);

	this.onmouseover = function(e) {
		if(e.target != this)
			return;
		Array.prototype.some.call(
			this.parentNode.getElementsByTagName("*"),
			function(node) {
				if(
					node != this
					&& node.namespaceURI == xulns
					// See https://github.com/Infocatcher/Custom_Buttons/issues/28
					//&& node.boxObject
					//&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
					&& "open" in node
					&& node.open
					&& node.getElementsByTagName("menupopup").length
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
	this.onmousedown = function(e) {
		if(e.target == this && e.button == 0 && hasModifier(e))
			e.preventDefault();
	};
	this.oncontextmenu = function(e) {
		if(e.target == this && !hasModifier(e) && hasUpdater())
			e.preventDefault();
	};
	this.onclick = function(e) {
		if(e.target != this)
			return;
		if(e.button == 0 && hasModifier(e) || e.button == 1)
			openAddonsManager();
		else if(e.button == 2 && !hasModifier(e) && hasUpdater())
			checkForAddonsUpdates.call(this);
	};
}
else { // Mouse gestures or something other...
	let e;
	if(typeof event == "object" && event instanceof Event && "screenX" in event) // FireGestures
		e = event;
	else if(
		this instanceof Components.interfaces.nsIDOMChromeWindow
		&& "mgGestureState" in window && "endEvent" in mgGestureState // Mouse Gestures Redox
	)
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
		throw new Error("[Toggle Restartless Add-ons]: Can't get event object");
	document.documentElement.appendChild(mp);
	mp.addEventListener("popuphidden", function destroy(e) {
		mp.removeEventListener(e.type, destroy, false);
		setTimeout(function() {
			mp.destroyMenu();
			mp.parentNode.removeChild(mp);
		}, 0);
	}, false);
	mp.openPopupAtScreen(e.screenX, e.screenY);
}

function getRestartlessAddons(addonTypes, callback, context) {
	if(!("AddonManager" in window))
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
	if(!("Services" in window))
		Components.utils.import("resource://gre/modules/Services.jsm");
	var then, promise = AddonManager.getAddonsByTypes(addonTypes, then = function(addons) {
		callback.call(context, addons.filter(function(addon) {
			var ops = addon.operationsRequiringRestart;
			return !addon.appDisabled
				&& !(ops & AddonManager.OP_NEEDS_RESTART_ENABLE || ops & AddonManager.OP_NEEDS_RESTART_DISABLE)
				&& (
					!addon.hidden
					|| options.showHidden > 0
					|| options.showHidden == -1 && !addon.userDisabled
				)
				&& (addon.iconURL || "").substr(0, 29) != "resource://search-extensions/";
		}));
	});
	promise && typeof promise.then == "function" && promise.then(then, Components.utils.reportError); // Firefox 61+
}
function openAddonOptions(addon) {
	// Based on code from chrome://mozapps/content/extensions/extensions.js
	// Firefox 21.0a1 (2013-01-27)
	var optionsURL = addon.optionsURL;
	if(!addon.isActive || !optionsURL)
		return false;
	if(addon.type == "plugin") // No options for now!
		return false;
	if(
		addon.optionsType == AddonManager.OPTIONS_TYPE_INLINE
		|| addon.optionsType == (AddonManager.OPTIONS_TYPE_INLINE_INFO || NaN)
		|| addon.optionsType == (AddonManager.OPTIONS_TYPE_INLINE_BROWSER || NaN)
	)
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
	var platformVersion = parseFloat(
		Services.appinfo.name == "Pale Moon"
			? Services.appinfo.version
			: Services.appinfo.platformVersion
	);
	scrollToPreferences = scrollToPreferences && platformVersion >= 12
		? "/preferences"
		: "";
	openAddonsManager("addons://detail/" + encodeURIComponent(addon.id) + scrollToPreferences);
}

function hasModifier(e) {
	return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
}

function addStyle() {
	if(addStyle.hasOwnProperty("_style"))
		return;
	var style = '\
		.toggleRestartlessAddons-isDelayed > .menu-iconic-text {\n\
			opacity: 0.75;\n\
			color: #070;\n\
		}\n\
		.toggleRestartlessAddons-isHidden > .menu-iconic-text {\n\
			color: #609;\n\
		}\n\
		.toggleRestartlessAddons-disabled > .menu-iconic-left {\n\
			opacity: 0.4;\n\
		}\n\
		.toggleRestartlessAddons-disabled > .menu-iconic-text,\n\
		.toggleRestartlessAddons-disabled > .menu-accel-container {\n\
			opacity: 0.5;\n\
		}\n\
		.toggleRestartlessAddons-askToActivate {\n\
			color: -moz-nativehyperlinktext;\n\
		}';
	addStyle._style = document.insertBefore(
		document.createProcessingInstruction(
			"xml-stylesheet",
			'href="' + "data:text/css,"
				+ encodeURIComponent(style) + '" type="text/css"'
		),
		document.documentElement
	);
}
function removeStyle() {
	if(!addStyle.hasOwnProperty("_style"))
		return;
	var s = addStyle._style;
	s.parentNode.removeChild(s);
	delete addStyle._style;
}
function closeMenus(node) {
	// Based on function closeMenus from chrome://browser/content/utilityOverlay.js
	for(; node && "tagName" in node; node = node.parentNode) {
		if(
			node.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
			&& (node.localName == "menupopup" || node.localName == "popup")
		)
			node.hidePopup();
	}
}
function _log(s) {
	if(typeof LOG == "function") // Custom Buttons
		LOG(s);
	else // Or something else
		Services.console.logStringMessage("Toggle Restartless Add-ons: " + s);
}

function hasUpdater() {
	var has = checkForAddonsUpdates.toString().indexOf("about:addons") != -1;
	hasUpdater = function() {
		return has;
	};
	return has;
}
function checkForAddonsUpdates() {
//== Check for Addons Updates begin

//== Check for Addons Updates end
}