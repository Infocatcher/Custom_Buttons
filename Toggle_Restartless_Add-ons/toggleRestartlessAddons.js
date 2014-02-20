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

// (c) Infocatcher 2013-2014
// version 0.1.2.1 - 2014-02-21

var options = {
	addonTypes: ["extension", "plugin"],
	// Possible values: "extension", "plugin"
	// From extensions: "userstyle" (Stylish), "greasemonkey-user-script" (Greasemonkey), "userscript" (Scriptish)
	// (swap to reorder in the menu)
	showVersions: 0,
	// 0 - don't show versions
	// 1 - show after name: "Addon Name 1.2"
	// 2 - show as "acceltext" (in place for hotkey text)
	sort: {
		enabled:     0,
		clickToPlay: 0,
		disabled:    0
		// Sort order:
		// 0, 0, 0 - sort add-ons of each type alphabetically
		// 0, 0, 1 - show enabled add-ons (of each type) first
		// 0, 1, 2 - enabled add-ons, then click-to-play and then disabled
	},
	closeMenu: true,
	// Close menu after left-click (use Shift+click to invert this behavior)
	closeMenuClickToPlay: -1
	// For click to play plugins:
	// -1 - invert Shift+click behavior
	// 0  - do nothing special
	// 1  - always don't close menu
};

var mp = document.createElement("menupopup");
mp.setAttribute("onpopupshowing", "this.updateMenu();");
mp.setAttribute("oncommand", "this.handleEvent(event);");
mp.setAttribute("onmousedown", "if(event.button == 0) this.handleEvent(event);");
mp.setAttribute("onclick", "if(event.button > 0) this.handleEvent(event);");
mp.setAttribute("oncontextmenu", "return false;");
mp.setAttribute("onpopuphidden", "this.destroyMenu();");

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
				df.appendChild(document.createElement("menuseparator"));
			prevType = type;
			var icon = addon.iconURL || addon.icon64URL
				|| type == "plugin"    && "chrome://mozapps/skin/plugins/pluginGeneric-16.png"
				|| type == "extension" && "chrome://mozapps/skin/extensions/extensionGeneric-16.png"
				|| "";
			var mi = document.createElement("menuitem");
			mi.className = "menuitem-iconic";
			var label = addon.name;
			if(options.showVersions == 1)
				label += " " + addon.version;
			else if(options.showVersions == 2)
				mi.setAttribute("acceltext", addon.version);
			mi.setAttribute("label", label);
			mi.setAttribute("image", icon);
			var desc = addon.description;
			desc && mi.setAttribute("tooltiptext", desc);
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
		var stayOpen = options.closeMenu ? e.shiftKey : !e.shiftKey;
		if(options.closeMenuClickToPlay && isAskToActivateAddon(addon))
			stayOpen = options.closeMenuClickToPlay == -1 ? !stayOpen : true;
		mi.setAttribute("closemenu", stayOpen ? "none" : "auto");
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
function isAskToActivateAddon(addon) {
	return addon.type == "plugin"
		&& "STATE_ASK_TO_ACTIVATE" in AddonManager
		&& Application.prefs.getValue("plugins.click_to_play", false);
}
function setNewDisabled(addon) {
	var newDis = getNewDisabled(addon);
	var oldDis = addon.userDisabled;
	addon.userDisabled = newDis;
	var realDis = addon.userDisabled;
	if(realDis != newDis) { // We can't enable vulnerable plugins
		var err = "Can't set addon.userDisabled to " + newDis + ", real value: " + realDis;
		if(newDis)
			Components.utils.reportError(err);
		else {
			LOG(err + "\nVulnerable plugin?");
			if(oldDis == AddonManager.STATE_ASK_TO_ACTIVATE)
				newDis = true;
			else
				newDis = AddonManager.STATE_ASK_TO_ACTIVATE;
			addon.userDisabled = newDis;
		}
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
function setDisabled(mi, disabled) {
	var askToActivate = "STATE_ASK_TO_ACTIVATE" in AddonManager && disabled == AddonManager.STATE_ASK_TO_ACTIVATE;
	if(askToActivate)
		mi.classList.add("toggleRestartlessAddons-askToActivate");
	else
		mi.classList.remove("toggleRestartlessAddons-askToActivate");
	if(disabled && !askToActivate)
		mi.classList.add("toggleRestartlessAddons-disabled");
	else
		mi.classList.remove("toggleRestartlessAddons-disabled");
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
	AddonManager.getAddonsByTypes(addonTypes, function(addons) {
		var restartless = addons.filter(function(addon) {
			var ops = addon.operationsRequiringRestart;
			return !addon.appDisabled
				&& !(ops & AddonManager.OP_NEEDS_RESTART_ENABLE || ops & AddonManager.OP_NEEDS_RESTART_DISABLE);
		});
		callback.call(context, restartless);
	});
}
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

function hasModifier(e) {
	return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
}

function addStyle() {
	if(addStyle.hasOwnProperty("_style"))
		return;
	var style = '\
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

function hasUpdater() {
	var has = checkForAddonsUpdates.toString().indexOf("Services.jsm") != -1;
	hasUpdater = function() {
		return has;
	};
	return has;
}
function checkForAddonsUpdates() {
//== Check for Addons Updates begin

//== Check for Addons Updates end
}