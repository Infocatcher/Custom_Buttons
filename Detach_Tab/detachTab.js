// http://infocatcher.ucoz.net/js/cb/detachTab.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Detach_Tab

// Detach Tab button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2012
// version 0.2.1 - 2012-10-15

var forceHideTabBar = false;

const ns = "_cbDetachTab_";
var btn = this;
if(ns + "detachedWindow" in btn)
	attachTab();
else
	detachTab();

function detachTab() {
	btn.checked = true;
	var selectedTab = gBrowser.selectedTab;
	btn[ns + "tabPos"] = "_tPos" in selectedTab
		? selectedTab._tPos
		: Array.prototype.indexOf.call(gBrowser.tabs || gBrowser.tabContainer.childNodes, selectedTab);
	if("TreeStyleTabService" in window)
		btn[ns + "parentTab"] = TreeStyleTabService.getParentTab(selectedTab);
	// See replaceTabWithWindow() in chrome://browser/content/tabbrowser.xml
	var opts = "chrome,dialog=no,all";
	//var opts = "chrome,dialog=0,resizable=1,location=0";
	var w = btn[ns + "detachedWindow"] = window.openDialog(getBrowserURL(), "_blank", opts, selectedTab);
	if(forceHideTabBar) {
		var autoHide = cbu.getPrefs("browser.tabs.autoHide");
		if(!autoHide)
			cbu.setPrefs("browser.tabs.autoHide", true);
	}
	var initDetachedWindow = function init(e) {
		w.removeEventListener(e.type, init, false);
		w.addEventListener("unload", destroyDetachedWindow, false);
		compactWindow(w);
	};
	var destroyDetachedWindow = function destroy(e, parentDestroy) {
		w.removeEventListener(e.type, destroy, false);
		window.removeEventListener("unload", destroyParentWindow, false);
		if(!parentDestroy)
			_attachTab();
		if(forceHideTabBar && !autoHide)
			cbu.setPrefs("browser.tabs.autoHide", false);
	};
	var destroyParentWindow = function destroy(e) {
		w.removeEventListener("DOMContentLoaded", initDetachedWindow, false);
		destroyDetachedWindow(e, true);
	};
	w.addEventListener("DOMContentLoaded", initDetachedWindow, false);
	window.addEventListener("unload", destroyParentWindow, false);
}
function attachTab() {
	if(!btn[ns + "detachedWindow"].closed)
		btn[ns + "detachedWindow"].close();
	else
		delete btn[ns + "detachedWindow"];
}
function _attachTab() {
	var tab = btn[ns + "detachedWindow"].gBrowser.selectedTab;
	var newTab = gBrowser.selectedTab = gBrowser.addTab();
	gBrowser.moveTabTo(newTab, btn[ns + "tabPos"]);
	if(ns + "parentTab" in btn) {
		let parentTab = btn[ns + "parentTab"];
		if(parentTab && parentTab.parentNode)
			gBrowser.treeStyleTab.attachTabTo(newTab, parentTab);
	}

	// Strange bug...
	// Temporary override some preferences
	var warnOnClose = cbu.getPrefs("browser.tabs.warnOnClose");
	if(warnOnClose)
		cbu.setPrefs("browser.tabs.warnOnClose", false);
	var warnOnQuit = cbu.getPrefs("browser.warnOnQuit");
	if(warnOnQuit)
		cbu.setPrefs("browser.warnOnQuit", false);

	try {
		gBrowser.swapBrowsersAndCloseOther(newTab, tab);
	}
	catch(e) {
		Components.utils.reportError(e);
	}

	if(warnOnClose)
		cbu.setPrefs("browser.tabs.warnOnClose", true);
	if(warnOnQuit)
		cbu.setPrefs("browser.warnOnQuit", true);

	window.focus();
	delete btn[ns + "detachedWindow"];
	delete btn[ns + "tabPos"];
	delete btn[ns + "parentTab"];
	btn.checked = false;
}
function compactWindow(win) {
	var document = win.document;
	// See styles for window[chromehidden~="*"] in chrome://global/content/xul.css
	// But don't use "display: none;"
	var style = '\
		#TabsToolbar,\n\
		#nav-bar, /* Just force hide, now used too complex tricks to handle "chromehidden" */\n\
		.tabbrowser-strip,\n\
		.treestyletab-splitter,\n\
		.chromeclass-menubar,\n\
		.chromeclass-directories,\n\
		.chromeclass-status,\n\
		.chromeclass-extrachrome,\n\
		.chromeclass-location,\n\
		.chromeclass-toolbar,\n\
		.chromeclass-toolbar-additional {\n\
			visibility: collapse !important;\n\
		}';
	var root = document.documentElement;
	document.insertBefore(
		document.createProcessingInstruction(
			"xml-stylesheet",
			'href="' + "data:text/css,"
				+ encodeURIComponent(style) + '" type="text/css"'
		),
		root
	);
	// See #main-window[disablechrome] ... in chrome://browser/content/browser.css
	// User may want override this styles
	var origSetAttribute = root.setAttribute;
	root.setAttribute = function(attr, val) {
		if(attr == "disablechrome")
			return undefined;
		return origSetAttribute.apply(this, arguments);
	};
	root.removeAttribute("disablechrome");
	root.offsetHeight; // Force reflow
}