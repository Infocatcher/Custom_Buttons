// http://infocatcher.ucoz.net/js/cb/checkForAddonsUpdates.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57958
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Check_for_Addons_Updates

// Check for Addons Updates button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012-2014
// version 0.1.5pre - 2014-07-22

// Button just open hidden tab with about:addons and trigger built-in "Check for Updates" function.
// And show tab, if found updates.

var btn = this;
if("_cb_disabled" in btn)
	return;
btn._cb_disabled = true;

if(!("Services" in window))
	Components.utils.import("resource://gre/modules/Services.jsm");
var app = Services.appinfo.name;

var ADDONS_URL = "about:addons";
var imgConnecting = "chrome://browser/skin/tabbrowser/connecting.png";
var imgLoading = "chrome://browser/skin/tabbrowser/loading.png";
if(app == "SeaMonkey")
	imgConnecting = imgLoading = "chrome://communicator/skin/icons/loading.gif";
else if(app == "Thunderbird") {
	imgConnecting = "chrome://messenger/skin/icons/connecting.png";
	imgLoading = "chrome://messenger/skin/icons/loading.png";
}

var image = btn.image;
var tip = btn.tooltipText;
btn.image = imgConnecting;
btn.tooltipText = "Open " + ADDONS_URL + "…";

var tab, browser, gBrowser;
var tbTabInfo, tbTab;

var trgWindow = Services.wm.getMostRecentWindow("navigator:browser")
	|| Services.wm.getMostRecentWindow("mail:3pane")
	|| window;
var trgDocument = trgWindow.document;
var tabmail = trgDocument.getElementById("tabmail");

if(tabmail) { // Thunderbird
	let addonsWin;
	let receivePong = function(subject, topic, data) {
		addonsWin = subject;
	};
	Services.obs.addObserver(receivePong, "EM-pong", false);
	Services.obs.notifyObservers(null, "EM-ping", "");
	Services.obs.removeObserver(receivePong, "EM-pong");
	if(addonsWin) {
		var rootWindow = addonsWin
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
			.rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);
		tabmail = rootWindow.document.getElementById("tabmail");
		tbTabInfo = tabmail.getBrowserForDocument(addonsWin);
		tbTab = tab = tbTabInfo.tabNode;
		processAddonsTab(addonsWin);
	}
	else {
		Services.obs.addObserver(function observer(subject, topic, data) {
			Services.obs.removeObserver(observer, topic);
			if(subject.document.readyState == "complete")
				processAddonsTab(subject);
			else {
				subject.addEventListener("load", function onLoad(e) {
					subject.removeEventListener(e.type, onLoad, false);
					processAddonsTab(subject);
				}, false);
			}
		}, "EM-loaded", false);
		// See openAddonsMgr() -> openContentTab()
		tbTabInfo = tabmail.openTab("contentTab", {
			contentPage: ADDONS_URL,
			clickHandler: "specialTabs.siteClickHandler(event, /addons\.mozilla\.org/);",
			background: true
		});
		tbTab = tab = tbTabInfo.tabNode;
		tbTab.collapsed = true;
		// Note: dontSelectHiddenTab() not implemented
	}
}
else {
	let isPending = false;
	let ws = Services.wm.getEnumerator("navigator:browser");
	windowsLoop:
	while(ws.hasMoreElements()) {
		let w = ws.getNext();
		let tabs = w.gBrowser.tabs;
		for(let i = 0, l = tabs.length; i < l; ++i) {
			let t = tabs[i];
			if(
				!t.closing
				&& t.linkedBrowser
				&& t.linkedBrowser.currentURI.spec == ADDONS_URL
			) {
				tab = t;
				break windowsLoop;
			}
		}
	}

	gBrowser = trgWindow.gBrowser;
	if(!tab) {
		tab = gBrowser.addTab(ADDONS_URL);
		tab.collapsed = true;
		tab.closing = true; // See "visibleTabs" getter in chrome://browser/content/tabbrowser.xml
		trgWindow.addEventListener("TabSelect", dontSelectHiddenTab, false);
	}
	else if(
		tab.getAttribute("pending") == "true" // Gecko >= 9.0
		|| tab.linkedBrowser.contentDocument.readyState == "uninitialized"
		// || tab.linkedBrowser.__SS_restoreState == 1
	)
		isPending = true;

	browser = tab.linkedBrowser;
	if(isPending || browser.webProgress.isLoadingDocument) {
		browser.addEventListener("load", processAddonsTab, true);
		if(isPending)
			browser.reload();
	}
	else {
		processAddonsTab();
	}
}

function processAddonsTab(e) {
	var doc;
	if(e && e instanceof Components.interfaces.nsIDOMWindow) {
		doc = e.document;
	}
	else if(e) {
		doc = e.target;
		if(doc.location != ADDONS_URL)
			return;
		browser.removeEventListener(e.type, processAddonsTab, true);
	}
	else {
		doc = browser.contentDocument;
	}

	btn.image = imgLoading;
	btn.tooltipText = $("updates-progress").getAttribute("value");

	var origIcon = tab.image;
	tab.image = image;

	var updEnabledPref = "extensions.update.enabled";
	var updEnabled = cbu.getPrefs(updEnabledPref);
	if(!updEnabled)
		cbu.setPrefs(updEnabledPref, true);

	var notFound = $("updates-noneFound");
	var updated = $("updates-installed");
	// Avoid getting false results from the past update check (may not be required for "noneFound")
	notFound.hidden = updated.hidden = true;

	$("cmd_findAllUpdates").doCommand();

	var waitTimer = setInterval(function() {
		if(!doc.defaultView || doc.defaultView.closed) {
			stopWait();
			notify("Tab with add-ons manager was closed!");
			return;
		}
		var inProgress = $("updates-progress");
		if(!inProgress.hidden)
			return;
		var autoUpdate = $("utils-autoUpdateDefault");
		var autoUpdateChecked = autoUpdate.getAttribute("checked") == "true";

		var found = $("updates-manualUpdatesFound-btn");
		if(
			autoUpdateChecked
				? notFound.hidden && updated.hidden
				: notFound.hidden && found.hidden
		) // Too early?
			return;

		stopWait();
		if(!tbTab)
			tab.closing = false;
		function removeTab() {
			if(!tab.collapsed)
				return;
			if(tbTab)
				tabmail.closeTab(tbTabInfo, true /*aNoUndo*/);
			else {
				gBrowser.removeTab(tab);
				(function forgetClosedTab(isSecondTry) {
					var ss = (
						Components.classes["@mozilla.org/browser/sessionstore;1"]
						|| Components.classes["@mozilla.org/suite/sessionstore;1"]
					).getService(Components.interfaces.nsISessionStore);
					if(!("forgetClosedTab" in ss))
						return;
					var closedTabs = JSON.parse(ss.getClosedTabData(window));
					for(let i = 0, l = closedTabs.length; i < l; ++i) {
						let closedTab = closedTabs[i];
						let state = closedTab.state;
						if(state.entries[state.index - 1].url == ADDONS_URL) {
							ss.forgetClosedTab(window, i);
							return;
						}
					}
					if(!isSecondTry) // May be needed in SeaMonkey
						setTimeout(forgetClosedTab, 0, true);
				})();
			}
		}

		if(!updEnabled)
			cbu.setPrefs(updEnabledPref, false);

		if(!notFound.hidden) {
			removeTab();
			notify(notFound.getAttribute("value"));
			return;
		}
		if(autoUpdateChecked) {
			removeTab();
			notify(updated.getAttribute("value"));
			return;
		}

		tab.collapsed = false;
		$("categories").selectedItem = $("category-availableUpdates");
		var tabWin = tab.ownerDocument.defaultView;
		if(tbTab)
			tabmail.switchToTab(tbTabInfo);
		else
			tabWin.gBrowser.selectedTab = tab;
		setTimeout(function() {
			tabWin.focus();
			doc.defaultView.focus();
			$("addon-list").focus();
		}, 0);
	}, 50);
	function $(id) {
		return doc.getElementById(id);
	}
	function stopWait() {
		clearInterval(waitTimer);
		btn.image = image;
		btn.tooltipText = tip;
		if(tab.image == image)
			tab.image = origIcon;
		trgWindow.removeEventListener("TabSelect", dontSelectHiddenTab, false);
		setTimeout(function() {
			delete btn._cb_disabled;
		}, 500);
	}
	function notify(msg) {
		Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService)
			.showAlertNotification(
				"chrome://mozapps/skin/extensions/extensionGeneric.png",
				btn.label,
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
		trgWindow.removeEventListener("TabSelect", dontSelectHiddenTab, false);
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