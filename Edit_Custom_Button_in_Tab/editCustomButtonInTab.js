// http://infocatcher.ucoz.net/js/cb/editCustomButtonInTab.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Edit_Custom_Button_in_Tab

// Edit Custom Button in Tab button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012-2013
// version 0.1.8.1 - 2013-11-16

// Note:
// In Firefox 3.6 and older:
// - "Save size and position of editor windows separately for each custom button" option should be enabled
// - tab with editor can't be closed sometimes using OK/Cancel buttons
// And in new Firefox/SeaMonkey versins reload command closes tab.

var editInTabLabel = (function() {
	var locale = (function() {
		//var prefs = Services.prefs;
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
		if(!prefs.getBoolPref("intl.locale.matchOS")) {
			var locale = prefs.getCharPref("general.useragent.locale");
			if(locale.substr(0, 9) != "chrome://")
				return locale;
		}
		return Components.classes["@mozilla.org/chrome/chrome-registry;1"]
			.getService(Components.interfaces.nsIXULChromeRegistry)
			.getSelectedLocale("global");
	})().match(/^[a-z]*/)[0];
	if(locale == "ru")
		return "Редактировать во вкладке…";
	return "Edit button in tab…";
})();

const editorBaseUri = "chrome://custombuttons/content/editor.xul";
const cbIdTabAttr = "custombuttons-editInTab-id";

const editId = "custombuttons-contextpopup-edit";
const editInTabId = editId + "InTab";
var editInTab = document.getElementById(editInTabId);
if(editInTab)
	editInTab.parentNode.removeChild(editInTab);
var editItem = document.getElementById(editId);
editInTab = editItem.cloneNode(true);
editInTab.id = editInTabId;
editInTab.setAttribute("cb_id", editInTabId);
editInTab.setAttribute("label", editInTabLabel);
editInTab.setAttribute("oncommand", "editCustomButtonInTab();");
//editInTab.removeAttribute("observes"); // For Firefox 3.6 and older
editInTab.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAitJREFUeNrEk0tIVVEUhr99zrnHc1+SkYQVFWo20G6SgkFRDorEILFJDoogkoLoXfOopEZCYIFlIITlRIUiC5UmFZVk1igwCAozfD9uat17z97tc5XK0pGDFiz289/rXz//FkopFhMGiwyr5GoHHgkpZUnCde9LqXwwHyuR3HVNIzZpGrubbLtjfHwYyzvywIYpHp0o386ajAAD3/R1MRfugZeFoGcgbm9pedo+7VVVCMvTwKt8tGwrfXGb5mfRJFj8VV0Ki7hpk9t5gW35lYx9GcSZGFOGSjJQvuXpYd4PTLPUYU6m+Q1SgzbBkEPey0tUHjlJfU8j0c8j+Aa/ahFn2x2cdknVgLBfpx5DyTQIBGx8+oHjras4vX8DtfWNFG0q4gmPyas9VqgZqEbNAEvPUnW1sCMI+QVBPXc02Ar5ONiURW55NsHus1TkjNDW2srHdYcormo/Z2kG+0p35BPTfaaHrVnBBAmt75QwKK3LYuPetdDbDxMTdHc2ELn4gfWj32l+MFQhdla1KVdKpCvxBPXAcWUSlQEaYgeIlK2GvmENHuHOmxVcW3mLoDuqn09gGjNiF8xnEPWw+DUFpTA0BS+uc/tdDodrnhf+445dV9p/LaQw+SH8nBfVRBMpKi0zm5LIEupq7lF541Vhy6lIV3XGTRw5qdWXM078bRSBK3zs6b3MWxEgplxSPnWS2e8kwXfPbO4SanIefy4cf7bWtdAl8d9/408BBgBVmNFVzOyEfgAAAABJRU5ErkJggg==");
editItem.parentNode.insertBefore(editInTab, editItem.nextSibling);

Array.filter( // Process already cloned menu items
	document.getElementsByAttribute("observes", editItem.getAttribute("observes")),
	function(mi) {
		var id = mi.id || "";
		return mi != editItem
			&& id.substr(0, editId.length) == editId
			&& id.substr(0, editInTabId.length) != editInTabId;
	}
).forEach(function(editItem, i) {
	var clone = editInTab.cloneNode(true);
	clone.id += "-cloned-" + i;
	editItem.parentNode.insertBefore(clone, editItem.nextSibling);
});

// Process #custombuttons-contextpopup-sub
const editIdSub = editId + "-sub";
var editItemSub = document.getElementById(editIdSub);
if(editItemSub) {
	var clone = editInTab.cloneNode(true);
	if(editItemSub.hasAttribute("observes"))
		clone.setAttribute("observes", editItemSub.getAttribute("observes"));
	else
		clone.removeAttribute("observes");
	clone.id += "-sub";
	editItemSub.parentNode.insertBefore(clone, editItemSub.nextSibling);
}

window.editCustomButtonInTab = function(btn, newTab) { // Should be global to work in cloned menus
	if(!btn)
		btn = custombuttons.popupNode;
	if(!btn)
		return;
	var link = custombuttons.makeButtonLink("edit", btn.id);
	var cbService = Components.classes["@xsms.nm.ru/custombuttons/cbservice;1"]
		.getService(Components.interfaces.cbICustomButtonsService);
	var param = cbService.getButtonParameters(link);
	var editorUri = editorBaseUri;
	if(cbService.mode & 64 /*CB_MODE_SAVE_EDITOR_SIZE_SEPARATELY*/)
		editorUri += "?window=" + cbService.getWindowId(document.documentURI) + "&id=" + btn.id;

	// Search for already opened tab
	var rawParam = unwrap(param);
	var isSeaMonkey = "Services" in window && Services.appinfo.name == "SeaMonkey";
	var ws = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		.getService(Components.interfaces.nsIWindowMediator)
		.getEnumerator(isSeaMonkey ? null : "navigator:browser");
	while(ws.hasMoreElements()) {
		let win = ws.getNext();
		if(isSeaMonkey && win.location.href != "chrome://navigator/content/navigator.xul")
			continue;
		let gBrowser = win.gBrowser;
		let tabs = gBrowser.tabs || gBrowser.tabContainer.childNodes;
		for(let i = 0, l = tabs.length; i < l; ++i) {
			let tab = tabs[i];
			if(tab == newTab)
				continue;
			let browser = tab.linkedBrowser;
			if(!browser)
				continue;
			let win = browser.contentWindow;
			if(win.location.href != editorUri)
				continue;
			let isSameEditor = cbService.mode & 64 /*CB_MODE_SAVE_EDITOR_SIZE_SEPARATELY*/;
			if(!isSameEditor) {
				let rawWin = unwrap(win);
				let winParam = "arguments" in rawWin && rawWin.arguments.length
					? unwrap(rawWin.arguments[0])
					: rawWin.editor && rawWin.editor.param;
				isSameEditor = winParam && winParam.buttonLink == link;
			}
			if(isSameEditor) {
				gBrowser.selectedTab = tab;
				win.focus();
				newTab && setTimeout(function() {
					gBrowser.removeTab(newTab);
				}, 0);
				return;
			}
		}
	}

	// Or open new tab
	var tab = newTab;
	if(!tab) {
		tab = gBrowser.selectedTab = gBrowser.addTab(editorUri);
		initSessionStore();
		tab.setAttribute(cbIdTabAttr, btn.id);
	}

	var browser = tab.linkedBrowser;
	browser.addEventListener("DOMContentLoaded", function load(e) {
		var doc = e.target;
		if(doc.location != editorUri)
			return;
		browser.removeEventListener(e.type, load, false);

		var win = doc.defaultView;
		win.arguments = [param];

		var iconLink = doc.createElementNS("http://www.w3.org/1999/xhtml", "link");
		iconLink.rel = "shortcut icon";
		//iconLink.href = "chrome://custombuttons-context/content/icons/default/custombuttonsEditor.ico";
		iconLink.href = getStdImage(rawParam.image);
		iconLink.style.display = "none";
		doc.documentElement.insertBefore(iconLink, doc.documentElement.firstChild);

		var alreadyAsked = false;
		function checkUnsaved(e) {
			if(alreadyAsked)
				return;
			if(!unwrap(doc).documentElement.cancelDialog())
				e.preventDefault();
		}
		function onDialogCancel(e) {
			alreadyAsked = true;
			// win.setTimeout shouldn't fire while confirmation dialog from the same window are opened
			win.setTimeout(function() {
				alreadyAsked = false;
			}, 100);
		}
		function destroy(e) {
			win.removeEventListener("dialogcancel", onDialogCancel, false);
			win.removeEventListener("beforeunload", checkUnsaved, false);
			win.removeEventListener("unload", destroy, false);
		}
		win.addEventListener("dialogcancel", onDialogCancel, false);
		win.addEventListener("beforeunload", checkUnsaved, false);
		win.addEventListener("unload", destroy, false);
	}, false);
};
function unwrap(o) {
	return o.wrappedJSObject || o; // Firefox 3.6 and older
}
function getStdImage(iid) {
	if(/^custombuttons-stdicon-(\d)$/.test(iid)) switch(+RegExp.$1) {
		// chrome://custombuttons/skin/custombuttons.css
		// toolbarbutton[cb-stdicon="custombuttons-stdicon-*"] { ... }
		case 1: return "chrome://custombuttons/skin/button.png";
		case 2: return "chrome://custombuttons/skin/stdicons/rbutton.png";
		case 3: return "chrome://custombuttons/skin/stdicons/gbutton.png";
		case 4: return "chrome://custombuttons/skin/stdicons/bbutton.png";
	}
	return iid || "chrome://custombuttons/skin/button.png";
}

function initSessionStore() {
	initSessionStore = function() {};
	var ss = (
		Components.classes["@mozilla.org/browser/sessionstore;1"]
		|| Components.classes["@mozilla.org/suite/sessionstore;1"]
	).getService(Components.interfaces.nsISessionStore);
	ss.persistTabAttribute(cbIdTabAttr);
}
function checkTab(tab) {
	var cbId = tab.getAttribute(cbIdTabAttr);
	if(!cbId)
		return;
	initSessionStore();
	let btn = document.getElementById(cbId);
	if(btn)
		editCustomButtonInTab(btn, tab);
}
// We can't use only SSTabRestoring: user can reload tab with editor
addEventListener("DOMContentLoaded", function(e) {
	var doc = e.target;
	if(doc.location.href.substr(0, editorBaseUri.length) != editorBaseUri)
		return;
	var tabs = gBrowser.tabs || gBrowser.tabContainer.childNodes;
	for(var i = 0, l = tabs.length; i < l; ++i) {
		let tab = tabs[i];
		let browser = tab.linkedBrowser;
		if(browser && browser.contentDocument == doc) {
			checkTab(tab);
			break;
		}
	}
}, true, gBrowser);
checkTab(gBrowser.selectedTab);

function destructor(reason) {
	if(reason == "update" || reason == "delete") {
		Array.slice(document.getElementsByAttribute("cb_id", editInTabId)).forEach(function(btn) {
			btn.parentNode.removeChild(btn);
		});
		delete window.editCustomButtonInTab;
	}
}
if(
	typeof addDestructor == "function" // Custom Buttons 0.0.5.6pre4+
	&& addDestructor != ("addDestructor" in window && window.addDestructor)
)
	addDestructor(destructor, this);
else
	this.onDestroy = destructor;