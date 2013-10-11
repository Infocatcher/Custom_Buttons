// http://infocatcher.ucoz.net/js/cb/undoCloseTabs.js
// https://forum.mozilla-russia.org/viewtopic.php?id=56267
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Undo_Close_Tabs

// Undo Close Tabs button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2009-2013
// version 0.3.1pre - 2013-04-01

var options = {
	menuTemplate: [
		"closedWindows",
		"separator",
		"restoreClosedWindows",
		"clearClosedWindows",
		"separator",
		"closedTabs",
		"separator",
		"restoreClosedTabs",
		"clearClosedTabs",
		"separator",
		"clearAll",
		"separator",
		"restoreLastSession",
		"separator",
		"buttonMenu"
	],
	showInTabContextMenu: false,
	/*
	menuTemplateTabContext: [ // like menuTemplate
		"closedTabs",
		"separator",
		"restoreClosedTabs",
		"clearClosedTabs"
	],
	*/
	hideRestoreAllForSingleEntry: false,
	allowDeleteEntries: true,
	openMenuOnMouseover: false,
	useMenu: false
};

function _localize(sid) {
	var strings = {
		en: {
			restoreTab: "Restore the most recently closed tab",

			restoreAllTabs: "Restore all tabs",
			restoreAllTabsAccesskey: "t",
			clearTabsHistory: "Clear history of closed tabs",
			clearTabsHistoryAccesskey: "b",

			restoreAllWindows: "Restore all windows",
			restoreAllWindowsAccesskey: "w",
			clearWindowsHistory: "Clear history of closed windows",
			clearWindowsHistoryAccesskey: "d",

			clearAllHistory: "Clear all history",
			clearAllHistoryAccesskey: "C",

			restoreLastSession: "Restore last session",
			restoreLastSessionAccesskey: "s",

			deleteUndoEntry: "Delete",

			buttonMenu: "Button menu",
			buttonMenuAccesskey: "m",

			tabContextMenu: "Recently Closed Tabs",
			tabContextMenuAccesskey: "y"
		},
		ru: {
			restoreTab: "Восстановить последнюю закрытую вкладку",

			restoreAllTabs: "Восстановить все вкладки",
			restoreAllTabsAccesskey: "л",
			clearTabsHistory: "Очистить историю закрытых вкладок",
			clearTabsHistoryAccesskey: "д",

			restoreAllWindows: "Восстановить все окна",
			restoreAllWindowsAccesskey: "о",
			clearWindowsHistory: "Очистить историю закрытых окон",
			clearWindowsHistoryAccesskey: "н",

			clearAllHistory: "Очистить всю историю",
			clearAllHistoryAccesskey: "ч",

			restoreLastSession: "Восстановить последнюю сессию",
			restoreLastSessionAccesskey: "с",

			deleteUndoEntry: "Удалить",

			buttonMenu: "Меню кнопки",
			buttonMenuAccesskey: "М",

			tabContextMenu: "Недавно закрытые вкладки",
			tabContextMenuAccesskey: "о"
		}
	};
	var locale = (cbu.getPrefs("general.useragent.locale") || "en").match(/^[a-z]*/)[0];
	_localize = function(sid) {
		return strings[locale] && strings[locale][sid] || strings.en[sid] || sid;
	};
	return _localize.apply(this, arguments);
}

var JSON = "JSON" in window
	? window.JSON
	: "nsIJSON" in Components.interfaces
		? {
			parse: function(s) {
				return Components.classes["@mozilla.org/dom/json;1"]
					.createInstance(Components.interfaces.nsIJSON)
					.decode(s);
			}
		}
		: {
			parse: function(s) {
				return Components.utils.evalInSandbox("(" + s + ")", new Components.utils.Sandbox("about:blank"));
			}
		};

this.onclick = function(e) {
	if(e.target != this)
		return;
	if(e.button == 1 || e.button == 0 && (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey))
		this.undoCloseTabsList.clearAllLists();
	else if(e.button == 0) {
		if(!this.undoCloseTabsList.options.useMenu) {
			if(this.undoCloseTabsList.closedTabCount)
				this.undoCloseTabsList.undoCloseTab();
			else
				this.undoCloseTabsList.drawUndoList() && this.undoCloseTabsList.showMenu(e);
		}
		// Allow use "command" section only from hotkey:
		e.preventDefault();
		e.stopPropagation();
	}
};
if(!this.hasOwnProperty("defaultContextId"))
	this.defaultContextId = this.getAttribute("context") || "custombuttons-contextpopup";
this.onmousedown = function(e) {
	if(e.target != this)
		return;
	if(this.undoCloseTabsList.options.useMenu) {
		if(e.button == 0)
			this.undoCloseTabsList.drawUndoList();
	}
	else if(e.button == 2) {
		var showCbMenu = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || !this.undoCloseTabsList.drawUndoList();
		this.setAttribute(
			"context",
			showCbMenu
				? this.defaultContextId
				: this.undoCloseTabsList.mpId
		);
	}
};
this.onmouseover = function(e) {
	if(e.target != this)
		return;
	if(!this.disabled)
		this.undoCloseTabsList.updUI();
	this.undoCloseTabsList.options.useMenu && Array.some(
		this.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != this
				&& node.namespaceURI == xulns
				&& node.boxObject
				&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
				&& node.open
				&& this.undoCloseTabsList.drawUndoList()
			) {
				node.open = false;
				this.open = true;
				return true;
			}
			return false;
		},
		this
	);
	if(!this.undoCloseTabsList.options.openMenuOnMouseover)
		return;
	if(!this.undoCloseTabsList.drawUndoList())
		return;
	var mp = this.undoCloseTabsList.mp;
	if("openPopup" in mp)
		mp.openPopup(this, "after_start");
	else
		mp.showPopup(this, -1, -1, "popup", "bottomleft", "topleft");
};

this.undoCloseTabsList = {
	button: this,
	options: options,
	mpId: this.id + "-context",
	cmId: this.id + "-contextSub",
	errPrefix: "[Custom Buttons :: Undo Close Tabs List]: ",
	get mp() {
		var mp = this.createElement("menupopup", {
			id: this.mpId,
			onpopupshowing: "if(event.target == this) document.popupNode = this.parentNode;",
			onpopuphidden: "if(event.target == this) document.popupNode = null;"
		});
		if(this.cm)
			mp.setAttribute("context", this.cmId);
		delete this.mp;
		return this.mp = this.button.appendChild(mp);
	},
	get cm() {
		delete this.cm;
		if(
			!this.options.allowDeleteEntries
			|| !("forgetClosedTab" in this.ss || "forgetClosedWindow" in this.ss)
		)
			return this.cm = null;
		var cm = document.getElementById(this.cmId);
		cm && cm.parentNode.removeChild(cm);
		cm = this.createElement("menupopup", {
			id: this.cmId,
			onpopupshowing: "return this.undoCloseTabsList.canDeleteUndoEntry(this.triggerNode || document.popupNode);"
		});
		var mi = this.createElement("menuitem", {
			oncommand: "this.parentNode.undoCloseTabsList.deleteUndoEntry(this.parentNode.triggerNode || document.popupNode);",
			label: _localize("deleteUndoEntry"),
			closemenu: "single"
		});
		cm.appendChild(mi);
		cm.undoCloseTabsList = this;
		return this.cm = document.getElementById("mainPopupSet").appendChild(cm);
	},
	get cbMenu() {
		var cbPopup = document.getElementById(this.button.defaultContextId);
		if(!cbPopup) {
			Components.utils.reportError(this.errPrefix + "cb menu not found");
			return this.cbMenu = null;
		}
		cbPopup = cbPopup.cloneNode(true);
		var id = "-" + this.button.id.match(/\d*$/)[0] + "-cloned";
		cbPopup.id += id;
		Array.slice(cbPopup.getElementsByAttribute("id", "*")).forEach(function(node) {
			node.id += id;
		});
		var menu = this.createElement("menu", {
			label: _localize("buttonMenu"),
			accesskey: _localize("buttonMenuAccesskey"),
			tooltiptext: ""
		});
		menu.appendChild(cbPopup);
		cbPopup.setAttribute(
			"onpopupshowing",
			'\
			var btn = document.popupNode = this.parentNode.parentNode.parentNode\n\
				.undoCloseTabsList.button;\n\
			custombutton.setContextMenuVisibility(btn);'
		);
		delete this.cbMenu;
		return this.cbMenu = menu;
	},
	ss: (
		Components.classes["@mozilla.org/browser/sessionstore;1"]
		|| Components.classes["@mozilla.org/suite/sessionstore;1"]
	).getService(Components.interfaces.nsISessionStore),
	get appInfo() {
		delete this.appInfo;
		return this.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);
	},
	get appVersion() {
		delete this.appVersion;
		return this.appVersion = parseFloat(this.appInfo.version);
	},
	get appName() {
		delete this.appName;
		return this.appName = this.appInfo.name;
	},

	init: function() {
		window.addEventListener("TabClose",       this, false);
		window.addEventListener("SSTabRestoring", this, false);
		window.addEventListener("unload",         this, false);
		this.mp.addEventListener("DOMMenuItemActive",   this, false);
		this.mp.addEventListener("DOMMenuItemInactive", this, false);
		this.updUIGlobal();
		if(this.options.showInTabContextMenu) setTimeout(function(_this) {
			_this.initTabContext();
		}, 100, this);
	},
	initTabContext: function() {
		var origMi = document.getElementById("context_undoCloseTab");
		if(!origMi) {
			LOG("#context_undoCloseTab not found!");
			return;
		}
		var menu = this.createElement("menu", {
			id: this.button.id + "-tabContextMenu",
			label: _localize("tabContextMenu"),
			accesskey: _localize("tabContextMenuAccesskey")
		});
		menu.undoCloseTabsList = this;
		var origMp = this.mp;
		var mp = origMp.cloneNode(true);
		mp.id = this.button.id + "-tabContext";
		var _this = this;
		function drawUndoList() {
			var ok = false;
			var opts = _this.options;
			var origTemplate = opts.menuTemplate;
			opts.menuTemplate = opts.menuTemplateTabContext || origTemplate;
			_this.mp = mp;
			try {
				ok = _this.drawUndoList();
			}
			catch(e) {
				Components.utils.reportError(e);
			}
			opts.menuTemplate = origTemplate;
			_this.mp = origMp;
			return ok;
		}
		mp._updatePopup = function(e) {
			if(e.target != this)
				return;
			document.popupNode = _this.button;
			drawUndoList();
		};
		mp.setAttribute("onpopupshowing", "this._updatePopup(event);");
		menu.appendChild(mp);
		addEventListener("popupshown", function(e) {
			if(e.target != e.currentTarget)
				return;
			setTimeout(function() { // Pseudo async
				if(drawUndoList())
					menu.removeAttribute("disabled");
				else
					menu.setAttribute("disabled", "true");
			}, 0);
		}, false, origMi.parentNode);
		addEventListener("DOMMenuItemActive",   this, false, mp);
		addEventListener("DOMMenuItemInactive", this, false, mp);
		origMi.parentNode.insertBefore(menu, origMi.nextSibling);
		origMi.setAttribute("hidden", "true");
	},
	destroy: function() {
		window.removeEventListener("TabClose",       this, false);
		window.removeEventListener("SSTabRestoring", this, false);
		window.removeEventListener("unload",         this, false);
		this.mp.removeEventListener("DOMMenuItemActive",   this, false);
		this.mp.removeEventListener("DOMMenuItemInactive", this, false);
		var menu = document.getElementById(this.button.id + "-tabContextMenu");
		if(menu) {
			menu.parentNode.removeChild(menu);
			document.getElementById("context_undoCloseTab").removeAttribute("hidden");
		}
	},
	handleEvent: function(e) {
		switch(e.type) {
			case "TabClose":
			case "SSTabRestoring":
				setTimeout(function(_this) {
					_this.updUI();
				}, 0, this);
			break;
			case "DOMMenuItemActive":
			case "DOMMenuItemInactive":
				if(!("XULBrowserWindow" in window))
					break;
				XULBrowserWindow.setOverLink(
					e.type == "DOMMenuItemActive"
						? (e.target.getAttribute("tooltiptext") || "")
							.replace(/ \n/g, ", ")
						: "",
					null
				);
			break;
			case "unload":
				this.updUIGlobal();
				this.destroy();
		}
	},

	createElement: function(name, attrs) {
		var node = document.createElement(name);
		if(attrs) for(var attrName in attrs) if(attrs.hasOwnProperty(attrName))
			node.setAttribute(attrName, attrs[attrName]);
		return node;
	},
	get closedWindowCount() {
		if(!("getClosedWindowCount" in this.ss)) {
			delete this.closedWindowCount;
			return this.closedWindowCount = 0;
		}
		this.__defineGetter__("closedWindowCount", function() {
			return this.ss.getClosedWindowCount();
		});
		return this.closedWindowCount;
	},
	get closedTabCount() {
		return this.ss.getClosedTabCount(window);
	},
	undoCloseTab: function(i) {
		if("undoCloseTab" in window) // Firefox 2.0+
			undoCloseTab(i);
		else // SeaMonkey
			gBrowser.undoCloseTab(i);
	},
	clearUndoTabsList: function(redrawList) {
		var closedTabCount = this.closedTabCount;
		if(!closedTabCount)
			return;
		if("forgetClosedTab" in this.ss) // Gecko 1.9.2+
			while(closedTabCount--)
				this.ss.forgetClosedTab(window, 0);
		else {
			// Doesn't work in SeaMonkey
			const pName = "browser.sessionstore.max_tabs_undo";
			let val = cbu.getPrefs(pName);
			cbu.setPrefs(pName, 0);
			cbu.setPrefs(pName, val);
		}
		this.updUIGlobal();
		redrawList && this.drawUndoList();
	},
	clearUndoWindowsList: function(redrawList) {
		var closedWindowCount = this.closedWindowCount;
		if(!closedWindowCount)
			return;
		if("forgetClosedWindow" in this.ss) // Gecko 1.9.2+
			while(closedWindowCount--)
				this.ss.forgetClosedWindow(0);
		else
			this.ss.setWindowState(window, '{"windows":[{}],"_closedWindows":[]}', false);
		this.updUIGlobal();
		redrawList && this.drawUndoList();
	},
	clearAllLists: function() {
		this.clearUndoTabsList();
		this.clearUndoWindowsList();
	},
	canDeleteUndoEntry: function(mi) {
		switch(mi.getAttribute("cb_type")) {
			case "tab":    return "forgetClosedTab"    in this.ss;
			case "window": return "forgetClosedWindow" in this.ss;
		}
		return false;
	},
	deleteUndoEntry: function(mi) {
		var i = +mi.getAttribute("cb_index");
		if(mi.getAttribute("cb_type") == "window") {
			this.ss.forgetClosedWindow(i);
			this.updUIGlobal();
		}
		else {
			this.ss.forgetClosedTab(window, i);
			this.updUI();
		}
		this.drawUndoList();
	},
	showMenu: function(e, isContext, mp) {
		var btn = this.button;
		document.popupNode = btn.ownerDocument.popupNode = btn;
		if(!mp)
			mp = this.mp;
		if("openPopupAtScreen" in mp)
			mp.openPopupAtScreen(e.screenX, e.screenY, isContext);
		else
			mp.showPopup(btn, e.screenX, e.screenY, isContext ? "context" : "popup", null, null);
	},
	drawUndoList: function() {
		var mp = this.mp;
		//while(mp.hasChildNodes())
		//	mp.removeChild(mp.lastChild);
		mp.textContent = "";

		var wc = this.closedWindowCount;
		var tc = this.closedTabCount;
		var ss = this.ss;
		var canRestoreLastSession = "restoreLastSession" in ss && ss.canRestoreLastSession
		if(!wc && !tc && !canRestoreLastSession) {
			mp.hidePopup();
			return false;
		}

		this._undoWindowItems = wc && JSON.parse(ss.getClosedWindowData());
		this._undoTabItems    = tc && JSON.parse(ss.getClosedTabData(window));
		var df = document.createDocumentFragment();

		this.options.menuTemplate.forEach(function(sid, indx, arr) {
			switch(sid) {
				case "closedWindows":
					wc && this.addUndoWindowsList(df);
				break;
				case "restoreClosedWindows":
					wc > this.options.hideRestoreAllForSingleEntry
					&& df.appendChild(this.createElement("menuitem", {
						label: _localize("restoreAllWindows"),
						accesskey: _localize("restoreAllWindowsAccesskey"),
						tooltiptext: "",
						oncommand: "for(var i = 0; i < " + this._undoWindowItems.length + "; ++i) undoCloseWindow();"
					}));
				break;
				case "clearClosedWindows":
					wc && df.appendChild(this.createElement("menuitem", {
						label: _localize("clearWindowsHistory"),
						accesskey: _localize("clearWindowsHistoryAccesskey"),
						tooltiptext: "",
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.clearUndoWindowsList();",
						onclick: "if(event.button == 1) this.parentNode.parentNode.undoCloseTabsList.clearUndoWindowsList(true);"
					}));
				break;
				case "closedTabs":
					tc && this.addUndoTabsList(df);
				break;
				case "restoreClosedTabs":
					tc > this.options.hideRestoreAllForSingleEntry
					&& df.appendChild(this.createElement("menuitem", {
						label: _localize("restoreAllTabs"),
						accesskey: _localize("restoreAllTabsAccesskey"),
						tooltiptext: "",
						oncommand: "for(var i = 0; i < " + this._undoTabItems.length + "; ++i) this.parentNode.parentNode.undoCloseTabsList.undoCloseTab();",
					}));
				break;
				case "clearClosedTabs":
					tc && df.appendChild(this.createElement("menuitem", {
						label: _localize("clearTabsHistory"),
						accesskey: _localize("clearTabsHistoryAccesskey"),
						tooltiptext: "",
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.clearUndoTabsList();",
						onclick: "if(event.button == 1) this.parentNode.parentNode.undoCloseTabsList.clearUndoTabsList(true);"
					}));
				break;
				case "clearAll":
					(
						wc && tc
						|| wc && arr.indexOf("clearClosedWindows") == -1
						|| tc && arr.indexOf("clearClosedTabs") == -1
					)
					&& df.appendChild(this.createElement("menuitem", {
						label: _localize("clearAllHistory"),
						accesskey: _localize("clearAllHistoryAccesskey"),
						tooltiptext: "",
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.clearAllLists();"
					}));
				break;
				case "restoreLastSession": // Gecko 2.0+
					canRestoreLastSession && df.appendChild(this.createElement("menuitem", {
						label: _localize("restoreLastSession"),
						accesskey: _localize("restoreLastSessionAccesskey"),
						tooltiptext: "",
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.ss.restoreLastSession();"
					}));
				break;
				case "buttonMenu":
					let cbMenu = this.cbMenu;
					if(cbMenu)
						df.appendChild(cbMenu);
				break;
				case "separator":
					if(df.hasChildNodes() && df.lastChild.localName != "menuseparator")
						df.appendChild(document.createElement("menuseparator"));
				break;
				default:
					Components.utils.reportError(this.errPrefix + 'Invalid template entry: "' + sid + '"');
			}
		}, this);

		while(df.hasChildNodes() && df.lastChild.localName == "menuseparator")
			df.removeChild(df.lastChild);

		this._undoWindowItems = this._undoTabItems = null;

		var show = df.hasChildNodes();
		if(show)
			mp.appendChild(df);
		else
			mp.hidePopup();
		return show;
	},
	addUndoWindowsList: function(undoPopup) {
		// Based on code from chrome://browser/content/browser.js
		// Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.3a1pre) Gecko/20090824 Minefield/3.7a1pre

		this._undoWindowItems.forEach(function(undoItem, i) {
			var tabs = undoItem.tabs;
			var mi = this.createElement("menuitem", {
				label: "(%count) %title"
					.replace("%title", undoItem.title)
					.replace("%count", tabs.length),
				"class": "menuitem-iconic bookmark-item menuitem-with-favicon",
				oncommand: "undoCloseWindow(" + i + ");",
				onclick: "if(event.button == 1) { undoCloseWindow(" + i + "); this.parentNode.parentNode.undoCloseTabsList.drawUndoList(); }",
				cb_index: i,
				cb_type: "window"
			});
			if(this.cm)
				mi.setAttribute("context", this.cmId);
			var selectedTab = tabs[undoItem.selected - 1];
			var icon = selectedTab.image || selectedTab.attributes && selectedTab.attributes.image;
			if(icon)
				mi.setAttribute("image", this.cachedIcon(icon));
			//if(selectedTab.entries && selectedTab.entries.length) // Can be [] for about:blank
			//	mi.setAttribute("tooltiptext", selectedTab.entries[selectedTab.index - 1].url);
			var uris = [];
			tabs.forEach(function(tab) {
				if(!tab.entries || !tab.entries.length) // Can be [] for about:blank
					return;
				var url = this.convertURI(tab.entries[tab.index - 1].url, 120);
				uris.push((tab == selectedTab && tabs.length > 1 ? "*" : "") + url);
			}, this);
			if(uris.length)
				mi.setAttribute("tooltiptext", uris.join(" \n"));
			if(i == 0)
				mi.setAttribute("key", "key_undoCloseWindow");
			undoPopup.appendChild(mi);
		}, this);
	},
	addUndoTabsList: function(undoPopup) {
		// Based on code from chrome://browser/content/browser.js
		// Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.3a1pre) Gecko/20090824 Minefield/3.7a1pre

		this._undoTabItems.forEach(function(undoItem, i) {
			var mi = this.createElement("menuitem", {
				label: undoItem.title,
				class: "menuitem-iconic bookmark-item menuitem-with-favicon",
				oncommand: "this.parentNode.parentNode.undoCloseTabsList.undoCloseTab(" + i + ");",
				onclick: "if(event.button == 1) { this.parentNode.parentNode.undoCloseTabsList.undoCloseTab(" + i + "); this.parentNode.parentNode.undoCloseTabsList.drawUndoList(); }",
				tooltiptext: this.convertURI(undoItem.state.entries[undoItem.state.index - 1].url),
				cb_index: i,
				cb_type: "tab"
			});
			if(this.cm)
				mi.setAttribute("context", this.cmId);
			var image = undoItem.image // Firefox
				|| undoItem.state && undoItem.state.attributes && undoItem.state.attributes.image; // SeaMonkey
			if(image)
				mi.setAttribute("image", this.cachedIcon(image));
			if(i == 0)
				mi.setAttribute("key", "key_undoCloseTab");
			undoPopup.appendChild(mi);
		}, this);
	},
	crop: function(s, crop) {
		if(crop == undefined)
			crop = 500;
		if(s.length <= crop)
			return s;
		var start = Math.round(crop*0.6);
		return s.substr(0, start) + "…" + s.substr(start - crop);
	},
	convertURI: function(uri, crop) {
		try {
			uri = losslessDecodeURI({ spec: uri });
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		return this.crop(uri, crop);
	},
	cachedIcon: function(src) {
		src = src.replace(/[&#]-moz-resolution=\d+,\d+$/, ""); // Firefox 22.0a1
		if(
			!/^https?:/.test(src)
			// IDN, see https://bugzilla.mozilla.org/show_bug.cgi?id=311045
			|| /^https?:\/\/[^.:\/]+\.[^a-z0-9-]+(?:\/|$)/.test(src)
			|| this.appName == "SeaMonkey" && this.appVersion <= 2
			|| this.appName == "Firefox"   && this.appVersion <= 3.5
		)
			return src;
		return "moz-anno:favicon:" + src; // https://bugzilla.mozilla.org/show_bug.cgi?id=467828
	},
	updUI: function() {
		var tabsCount = this.closedTabCount;
		var dis = !tabsCount && !this.closedWindowCount;
		if(
			dis
			&& this.options.useMenu
			&& this.options.menuTemplate.indexOf("restoreLastSession") != -1
			&& "restoreLastSession" in this.ss && this.ss.canRestoreLastSession
		)
			dis = false;
		this.button.disabled = dis;
		var lastTabTip = "";
		if(tabsCount) {
			//~ todo: try optimize JSON.parse() usage (can we use cached this._undoTabItems here?)
			// Or update tooltipText only on mouseover
			let undoTabItems = JSON.parse(this.ss.getClosedTabData(window));
			let lastItem = undoTabItems[0];
			lastTabTip = " \n" + this.crop(lastItem.title)
				+ " \n" + this.convertURI(lastItem.state.entries[lastItem.state.index - 1].url);
		}
		this.button.tooltipText = _localize("restoreTab") + lastTabTip;
	},
	updUIGlobal: function() {
		var ws = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator)
			.getEnumerator("navigator:browser");
		const id = this.button.id;
		while(ws.hasMoreElements()) {
			let btn = ws.getNext().document.getElementById(id);
			btn && btn.undoCloseTabsList.updUI();
		}
	}
};

if(!this.undoCloseTabsList.options.useMenu && this.undoCloseTabsList.cm) {
	this.oncontextmenu = function(e) {
		if(
			e.target != this
			|| e.ctrlKey || e.shiftKey || e.altKey || e.metaKey
			|| !this.undoCloseTabsList.mp.hasChildNodes()
		)
			return;
		e.preventDefault();
		this.undoCloseTabsList.showMenu(e); // Show menu without "context" flag
	};
}

setTimeout(function(_this) {
	_this.undoCloseTabsList.init();
}, 0, this);

//===================
// Styles
// Used icons from Undo Closed Tabs Button extension

// Styles can't override hardcoded icon
var icon = this.ownerDocument.getAnonymousElementByAttribute(this, "class", "toolbarbutton-icon");
if(icon)
	icon.src = "";
else
	this.image = "";

var cssStr = '\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	@-moz-document url("%windowURL%") {\n\
		%button% {\n\
			list-style-image: url("data:image/png;base64,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") !important;\n\
			-moz-image-region: rect(0, 24px, 24px, 0) !important;\n\
		}\n\
		%button%:hover {\n\
			-moz-image-region: rect(0, 48px, 24px, 24px) !important;\n\
		}\n\
		%button%[disabled="true"] {\n\
			-moz-image-region: rect(0, 72px, 24px, 48px) !important;\n\
		}\n\
		toolbar[iconsize="small"] %button% {\n\
			-moz-image-region: rect(24px, 16px, 40px, 0) !important;\n\
		}\n\
		toolbar[iconsize="small"] %button%:hover {\n\
			-moz-image-region: rect(24px, 32px, 40px, 16px) !important;\n\
		}\n\
		toolbar[iconsize="small"] %button%[disabled="true"] {\n\
			-moz-image-region: rect(24px, 48px, 40px, 32px) !important;\n\
		}\n\
	}'
	.replace(/%windowURL%/g, window.location.href)
	.replace(/%button%/g, "#" + this.id);
var cssURI = this.cssURI = Components.classes["@mozilla.org/network/io-service;1"]
	.getService(Components.interfaces.nsIIOService)
	.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
var sss = this.sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
	.getService(Components.interfaces.nsIStyleSheetService);
if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
	sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);


this.onDestroy = function(reason) {
	this.undoCloseTabsList.destroy();
	if(reason == "update" || reason == "delete") {
		let sss = this.sss;
		let cssURI = this.cssURI;
		if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
	}
};
if(this.undoCloseTabsList.options.useMenu) {
	this.type = "menu";
	this.orient = "horizontal";
}