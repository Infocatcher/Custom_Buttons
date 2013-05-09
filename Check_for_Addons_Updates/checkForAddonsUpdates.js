// http://infocatcher.ucoz.net/js/cb/checkForAddonsUpdates.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57958
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Check_for_Addons_Updates

// Check for Addons Updates button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012-2013
// version 0.1.3 - 2013-02-07

// Button just open hidden tab with about:addons and trigger built-in "Check for Updates" function.
// And show tab, if found updates.

var btn = this;
if("_cb_disabled" in btn)
	return;
btn._cb_disabled = true;

Components.utils.import("resource://gre/modules/Services.jsm");
var appName = Services.appinfo.name;

var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
if(appName == "SeaMonkey")
	imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";

var image = btn.image;
var tip = btn.tooltipText;
btn.image = imgConnecting;
btn.tooltipText = "Open about:addons…";

var tab;
var ws = Services.wm.getEnumerator("navigator:browser");
windowsLoop:
while(ws.hasMoreElements()) {
	let w = ws.getNext();
	let tabs = w.gBrowser.tabs;
	for(let i = 0, l = tabs.length; i < l; ++i) {
		let t = tabs[i];
		if(
			!t.closing
			&& t.linkedBrowser
			&& t.linkedBrowser.currentURI.spec == "about:addons"
		) {
			tab = t;
			break windowsLoop;
		}
	}
}

if(!tab) {
	tab = gBrowser.addTab("about:addons");
	tab.collapsed = true;
	tab.closing = true; // See "visibleTabs" getter in chrome://browser/content/tabbrowser.xml
	window.addEventListener("TabSelect", dontSelectHiddenTab, false);
}
else if(
	tab.getAttribute("pending") == "true" // Gecko >= 9.0
	|| tab.linkedBrowser.contentDocument.readyState == "uninitialized"
	// || tab.linkedBrowser.__SS_restoreState == 1
)
	tab.linkedBrowser.reload();

var browser = tab.linkedBrowser;
if(browser.webProgress.isLoadingDocument)
	browser.addEventListener("load", processAddonsTab, true);
else
	processAddonsTab();

function processAddonsTab(e) {
	var doc;
	if(e) {
		doc = e.target;
		if(doc.location != "about:addons")
			return;
		browser.removeEventListener(e.type, processAddonsTab, true);
	}
	else {
		doc = browser.contentDocument;
	}

	btn.image = imgLoading;
	btn.tooltipText = doc.getElementById("updates-progress").getAttribute("value");

	var origIcon = tab.image;
	tab.image = image;

	var updEnabledPref = "extensions.update.enabled";
	var updEnabled = cbu.getPrefs(updEnabledPref);
	if(!updEnabled)
		cbu.setPrefs(updEnabledPref, true);

	//Avoid getting false results from the past update check (May not be required for "noneFound")
	doc.getElementById("updates-noneFound").hidden = true;
	doc.getElementById("updates-installed").hidden = true;

	doc.getElementById("cmd_findAllUpdates").doCommand();

	var wait = setInterval(function() {
		if(!doc.defaultView || doc.defaultView.closed) {
			stopWait();
			notify("Tab with add-ons manager was closed!");
			return;
		}
		var inProgress = doc.getElementById("updates-progress");
		if(!inProgress.hidden)
			return;
		var autoUpdate = doc.getElementById("utils-autoUpdateDefault");
		var autoUpdateChecked = autoUpdate.getAttribute("checked") == "true";
		var updated = doc.getElementById("updates-installed");
		var found = doc.getElementById("updates-manualUpdatesFound-btn");
		var notFound = doc.getElementById("updates-noneFound");

		if(
			autoUpdateChecked
				? updated.hidden && notFound.hidden
				: found.hidden && notFound.hidden
		) // Too early?
			return;

		stopWait();
		tab.closing = false;

		if(!updEnabled)
			cbu.setPrefs(updEnabledPref, false);

		if(!notFound.hidden) {
			if(tab.collapsed)
				gBrowser.removeTab(tab);
			notify(notFound.getAttribute("value"));
			return;
		}
		if(autoUpdateChecked) {
			if(tab.collapsed)
				gBrowser.removeTab(tab);
			notify(updated.getAttribute("value"));
			return;
		}
		tab.collapsed = false;
		doc.getElementById("categories").selectedItem = doc.getElementById("category-availableUpdates");
		var tabWin = tab.ownerDocument.defaultView;
		tabWin.gBrowser.selectedTab = tab;
		setTimeout(function() {
			tabWin.focus();
			doc.defaultView.focus();
			doc.getElementById("addon-list").focus();
		}, 0);
	}, 50);
	function stopWait() {
		clearInterval(wait);
		btn.image = image;
		btn.tooltipText = tip;
		if(tab.image == image)
			tab.image = origIcon;
		window.removeEventListener("TabSelect", dontSelectHiddenTab, false);
		setTimeout(function() {
			delete btn._cb_disabled;
		}, 500);
	}
	function notify(msg) {
		Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService)
			.showAlertNotification(
				"chrome://mozapps/skin/extensions/extensionGeneric.png",
				"Auto-Updater",
				msg, false, "", null
			);
	}
}
function dontSelectHiddenTab(e) {
	// <tab /><tab collapsed="true" />
	// Close first tab: collapsed tab becomes selected
	if(e.target != tab)
		return;

	if(/\n(?:BrowserOpenAddonsMgr|toEM)@chrome:\/\//.test(new Error().stack)) {
		// User open Add-ons Manager, show tab
		window.removeEventListener("TabSelect", dontSelectHiddenTab, false);
		setTimeout(function() { // Hidden tab can't be selected, so select it manually...
			tab.collapsed = tab.closing = false;
			gBrowser.selectedTab = tab;
		}, 0);
	}

	function done(t) {
		if(!t.hidden && !t.closing) {
			e.preventDefault();
			e.stopPropagation();
			return gBrowser.selectedTab = t;
		}
		return false;
	}
	for(var t = tab.nextSibling; t; t = t.nextSibling)
		if(done(t))
			return;
	for(var t = tab.previousSibling; t; t = t.previousSibling)
		if(done(t))
			return;
}