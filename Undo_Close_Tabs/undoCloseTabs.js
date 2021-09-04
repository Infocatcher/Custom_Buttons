// http://infocatcher.ucoz.net/js/cb/undoCloseTabs.js
// https://forum.mozilla-russia.org/viewtopic.php?id=56267
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Undo_Close_Tabs

// Undo Close Tabs button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2009-2021
// version 0.3.3.3 - 2021-09-04

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
	windowItemTemplate: "(%count) %title",
	windowSelectedTabPrefix: "*",
	buttonTipTemplate: ["header", "title", "url", "closedAt"],
	itemTipTemplate: ["title", "url", "closedAt"],
	hideRestoreAllForSingleEntry: false,
	allowDeleteEntries: true,
	accesskeys: { // Empty string ("") to disable or string with possible values ("0123...", "abcd...")
		closedTabs: "",
		closedWindows: ""
	},
	accesskeySeparator: " ", // <accesskey><separator><label>
	openMenuOnMouseover: false,
	useMenu: false,
	rightClickToUndoCloseTab: false // Useful with "useMenu: true"
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
			tabContextMenuAccesskey: "y",

			itemTip: "%ago ago, %date",
			day: "d"
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
			tabContextMenuAccesskey: "о",

			itemTip: "%ago назад, %date",
			day: "д"
		}
	};
	var locale = (function() {
		if("Services" in window && "locale" in Services) {
			var locales = Services.locale.requestedLocales // Firefox 64+
				|| Services.locale.getRequestedLocales && Services.locale.getRequestedLocales();
			if(locales)
				return locales[0];
		}
		var prefs = "Services" in window && Services.prefs
			|| Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		function pref(name, type) {
			return prefs.getPrefType(name) != prefs.PREF_INVALID ? prefs["get" + type + "Pref"](name) : undefined;
		}
		if(!pref("intl.locale.matchOS", "Bool")) { // Also see https://bugzilla.mozilla.org/show_bug.cgi?id=1414390
			var locale = pref("general.useragent.locale", "Char");
			if(locale && locale.substr(0, 9) != "chrome://")
				return locale;
		}
		return Components.classes["@mozilla.org/chrome/chrome-registry;1"]
			.getService(Components.interfaces.nsIXULChromeRegistry)
			.getSelectedLocale("global");
	})().match(/^[a-z]*/)[0];
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
	else if(
		e.button == 0
		|| e.button == 2 && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey
			&& this.undoCloseTabsList.options.rightClickToUndoCloseTab
	) {
		if(
			e.button == 0 && !this.undoCloseTabsList.options.useMenu
			|| e.button == 2 && this.undoCloseTabsList.options.rightClickToUndoCloseTab
		) {
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
	this.undoCloseTabsList.options.useMenu && Array.prototype.some.call(
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
	if(
		this.undoCloseTabsList.options.openMenuOnMouseover
		&& this.undoCloseTabsList.drawUndoList()
	)
		this.undoCloseTabsList.openMenu();
};

this.undoCloseTabsList = {
	button: this,
	options: options,
	mpId: this.id + "-context",
	cmId: this.id + "-contextSub",
	tcmId: this.id + "-tabContextMenu",
	tipId: this.id + "-tooltip",
	errPrefix: "[Custom Buttons :: Undo Close Tabs List]: ",
	get mp() {
		var btn = this.button;
		var mp = btn.getElementsByTagName("menupopup");
		mp = mp.length && mp[0];
		mp && mp.parentNode.removeChild(mp);
		mp = this.createElement("menupopup", {
			id: this.mpId,
			onclick: "this.parentNode.undoCloseTabsList.checkForMiddleClick(event);",
			onpopupshowing: "if(event.target == this) document.popupNode = this.parentNode;",
			onpopuphidden: "if(event.target == this) document.popupNode = null;"
		});
		if(this.cm)
			mp.setAttribute("context", this.cmId);
		var tb = btn.parentNode;
		if(
			this.options.useMenu
			&& tb.getAttribute("orient") == "vertical"
		) {
			// https://addons.mozilla.org/firefox/addon/vertical-toolbar/
			var isRight = tb.parentNode.getAttribute("placement") == "right";
			mp.setAttribute("position", isRight ? "start_before" : "end_before");
		}
		delete this.mp;
		return this.mp = btn.appendChild(mp);
	},
	get useCentextMenu() {
		delete this.useCentextMenu;
		return this.useCentextMenu = this.options.allowDeleteEntries
			&& ("forgetClosedTab" in this.ss || "forgetClosedWindow" in this.ss);
	},
	get cm() {
		delete this.cm;
		if(!this.useCentextMenu)
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
		Array.prototype.slice.call(cbPopup.getElementsByAttribute("id", "*")).forEach(function(node) {
			node.id += id;
		});
		var menu = this.createElement("menu", {
			label: _localize("buttonMenu"),
			accesskey: _localize("buttonMenuAccesskey")
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
	get ss() {
		delete this.ss;
		return this.ss = "nsISessionStore" in Components.interfaces
			? (
				Components.classes["@mozilla.org/browser/sessionstore;1"]
				|| Components.classes["@mozilla.org/suite/sessionstore;1"]
			).getService(Components.interfaces.nsISessionStore)
			: SessionStore; // Firefox 61+ https://bugzilla.mozilla.org/show_bug.cgi?id=1450559
	},
	get appInfo() {
		delete this.appInfo;
		return this.appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
			.getService(Components.interfaces.nsIXULAppInfo);
	},
	get appVersion() {
		delete this.appVersion;
		return this.appVersion = parseFloat(this.appInfo.version);
	},
	get platformVersion() {
		delete this.platformVersion;
		return this.platformVersion = parseFloat(this.appInfo.platformVersion);
	},
	get appName() {
		delete this.appName;
		return this.appName = this.appInfo.name;
	},

	init: function() {
		window.addEventListener("TabClose",       this, false);
		window.addEventListener("SSTabRestoring", this, false);
		window.addEventListener("unload",         this, false);
		if(this.appName == "SeaMonkey") // No SSTab* events in SeaMonkey
			window.addEventListener("TabOpen", this, false);
		setTimeout(function(_this) {
			_this.mp.addEventListener("DOMMenuItemActive",   _this, false);
			_this.mp.addEventListener("DOMMenuItemInactive", _this, false);
			_this.initTooltip();
		}, 50, this);
		this.addPbExitObserver(true);
		this.updUIGlobal();
		if(this.options.showInTabContextMenu) setTimeout(function(_this) {
			_this.initTabContext();
		}, 100, this);
	},
	initTabContext: function() {
		var origMi = this.tabContextUndoClose;
		if(!origMi) {
			LOG("Can't find \"Undo Close Tab\" item in tab context menu");
			return;
		}
		var menu = document.getElementById(this.tcmId);
		menu && menu.parentNode.removeChild(menu); // For SeaMonkey
		menu = this.createElement("menu", {
			id: this.tcmId,
			label: _localize("tabContextMenu"),
			accesskey: _localize("tabContextMenuAccesskey"),
			tooltip: this.tipId,
			popupsinherittooltip: "true"
		});
		menu.undoCloseTabsList = this;
		menu.onclick = function(e) {
			if(e.target != this)
				return;
			if(e.button == 1 || e.button == 0 && (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)) {
				if(this.undoCloseTabsList.closedTabCount) {
					this.undoCloseTabsList.undoCloseTab();
					closeMenus(this);
				}
			}
		};
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
		function updMenu() {
			if(drawUndoList())
				menu.removeAttribute("disabled");
			else
				menu.setAttribute("disabled", "true");
		}
		mp._updatePopup = function(e) {
			if(e.target != this)
				return;
			document.popupNode = _this.button;
			drawUndoList();
		};
		mp.setAttribute("onpopupshowing", "this._updatePopup(event);");
		mp.onclick = function(e) {
			_this.checkForMiddleClick(e, updMenu);
		};
		menu.appendChild(mp);
		addEventListener("popupshown", function(e) {
			if(e.target == e.currentTarget)
				setTimeout(updMenu, 0); // Pseudo async
		}, false, origMi.parentNode);
		addEventListener("DOMMenuItemActive",   this, false, mp);
		addEventListener("DOMMenuItemInactive", this, false, mp);
		origMi.parentNode.insertBefore(menu, origMi.nextSibling);
		origMi.setAttribute("hidden", "true");
	},
	initTooltip: function() {
		var tip = document.getElementById(this.tipId);
		tip && tip.parentNode.removeChild(tip);
		tip = this.tip = this.createElement("tooltip", {
			id: this.tipId,
			orient: "vertical",
			onpopupshowing: "return this.undoCloseTabsList.updTooltip(this, this.triggerNode || document.tooltipNode);",
			onpopuphiding: "this.cancelUpdateTimer();"
		});
		tip.undoCloseTabsList = this;
		tip._updateTimer = 0;
		tip.initUpdateTimer = function(fn, context) {
			if(this._updateTimer)
				clearInterval(this._updateTimer);
			this._updateTimer = setInterval(function() {
				fn.call(context);
			}, 1000);
		};
		tip.cancelUpdateTimer = function() {
			if(this._updateTimer) {
				clearInterval(this._updateTimer);
				this._updateTimer = 0;
			}
		};
		var btn = this.button;
		btn.removeAttribute("tooltiptext");
		btn.setAttribute("tooltip", this.tipId);
		btn.setAttribute("popupsinherittooltip", "true");
		document.getElementById("mainPopupSet").appendChild(tip);
		if(this.appVersion >= 61 && "getAnonymousElementByAttribute" in document) {
			var label = document.getAnonymousElementByAttribute(tip, "class", "tooltip-label");
			label && label.remove();
		}
	},
	_hasPbExitObserver: false,
	addPbExitObserver: function(add) {
		if(add == this._hasPbExitObserver || !("Services" in window))
			return;
		this._hasPbExitObserver = add;
		if(add)
			Services.obs.addObserver(this, "last-pb-context-exited", false);
		else
			Services.obs.removeObserver(this, "last-pb-context-exited");
	},
	destroy: function() {
		window.removeEventListener("TabClose",       this, false);
		window.removeEventListener("SSTabRestoring", this, false);
		window.removeEventListener("unload",         this, false);
		if(this.appName == "SeaMonkey")
			window.removeEventListener("TabOpen", this, false);
		this.mp.removeEventListener("DOMMenuItemActive",   this, false);
		this.mp.removeEventListener("DOMMenuItemInactive", this, false);
		this.addPbExitObserver(false);
		var menu = document.getElementById(this.tcmId);
		if(menu) {
			menu.parentNode.removeChild(menu);
			this.tabContextUndoClose.removeAttribute("hidden");
		}
		var tip = this.tip;
		tip && tip.parentNode && tip.parentNode.removeChild(tip);
	},
	handleEvent: function(e) {
		switch(e.type) {
			case "TabClose":
			case "SSTabRestoring":
			case "TabOpen":
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
						? (e.target.getAttribute("cb_urlDecoded") || "")
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
	observe: function(subject, topic, data) {
		if(topic == "last-pb-context-exited") {
			setTimeout(function(_this) {
				_this.updUI();
			}, 25, this);
		}
	},

	createElement: function(name, attrs) {
		var node = document.createElementNS(xulns, name);
		if(attrs) for(var attrName in attrs) if(attrs.hasOwnProperty(attrName))
			node.setAttribute(attrName, attrs[attrName]);
		return node;
	},
	get tabContextUndoClose() {
		return document.getElementById("context_undoCloseTab")
			|| document.getElementById("tabContextUndoCloseTab") // Firefox 2.0
			|| document.getAnonymousElementByAttribute(gBrowser, "tbattr", "tabbrowser-undoclosetab"); // SeaMonkey
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
	clearUndoTabsList: function() {
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
	},
	clearUndoWindowsList: function() {
		var closedWindowCount = this.closedWindowCount;
		if(!closedWindowCount)
			return;
		if("forgetClosedWindow" in this.ss) // Gecko 1.9.2+
			while(closedWindowCount--)
				this.ss.forgetClosedWindow(0);
		else
			this.ss.setWindowState(window, '{"windows":[{}],"_closedWindows":[]}', false);
		this.updUIGlobal();
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
	openMenu: function() {
		var mp = this.mp;
		if("openPopup" in mp)
			mp.openPopup(this.button, "after_start");
		else
			mp.showPopup(this.button, -1, -1, "popup", "bottomleft", "topleft");
	},
	drawUndoList: function() {
		var mp = this.mp;

		var wc = this.closedWindowCount;
		var tc = this.closedTabCount;
		var ss = this.ss;
		var canRestoreLastSession = "restoreLastSession" in ss && ss.canRestoreLastSession
		if(!wc && !tc && !canRestoreLastSession) {
			mp.textContent = "";
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
						oncommand: "for(var i = 0; i < " + this._undoWindowItems.length + "; ++i) undoCloseWindow();"
					}));
				break;
				case "clearClosedWindows":
					wc && df.appendChild(this.createElement("menuitem", {
						label: _localize("clearWindowsHistory"),
						accesskey: _localize("clearWindowsHistoryAccesskey"),
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.clearUndoWindowsList();"
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
						oncommand: "for(var i = 0; i < " + this._undoTabItems.length + "; ++i) this.parentNode.parentNode.undoCloseTabsList.undoCloseTab();"
					}));
				break;
				case "clearClosedTabs":
					tc && df.appendChild(this.createElement("menuitem", {
						label: _localize("clearTabsHistory"),
						accesskey: _localize("clearTabsHistoryAccesskey"),
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.clearUndoTabsList();"
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
						oncommand: "this.parentNode.parentNode.undoCloseTabsList.clearAllLists();"
					}));
				break;
				case "restoreLastSession": // Gecko 2.0+
					canRestoreLastSession && df.appendChild(this.createElement("menuitem", {
						label: _localize("restoreLastSession"),
						accesskey: _localize("restoreLastSessionAccesskey"),
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
						df.appendChild(document.createElementNS(xulns, "menuseparator"));
				break;
				default:
					Components.utils.reportError(this.errPrefix + 'Invalid template entry: "' + sid + '"');
			}
		}, this);

		while(df.hasChildNodes() && df.lastChild.localName == "menuseparator")
			df.removeChild(df.lastChild);

		this._undoWindowItems = this._undoTabItems = null;

		mp.textContent = "";
		if(!df.hasChildNodes()) {
			mp.hidePopup();
			return false;
		}
		mp.appendChild(df);
		return true;
	},
	addUndoWindowsList: function(undoPopup) {
		// Based on code from chrome://browser/content/browser.js
		// Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.3a1pre) Gecko/20090824 Minefield/3.7a1pre

		var keys = this.options.accesskeys.closedWindows;
		this._undoWindowItems.forEach(function(undoItem, i) {
			var tabs = undoItem.tabs;
			var [key, keyPrefix] = this.getKey(keys, i);
			var title = undoItem.title;
			var selected = undoItem.selected;
			var selectedTab = tabs[selected && selected - 1];
			var urls = [];
			tabs.forEach(function(tab) {
				if(!tab.entries || !tab.entries.length) // Can be [] for about:blank
					return;
				var url = this.convertURI(tab.entries[tab.index - 1].url, 120);
				var selectedPrefix = tab == selectedTab && tabs.length > 1
					? this.options.windowSelectedTabPrefix
					: "";
				urls.push(selectedPrefix + url);
			}, this);
			var url = urls.join(" \n");
			var mi = this.createElement("menuitem", {
				label: keyPrefix + this.options.windowItemTemplate
					.replace("%title", title)
					.replace("%count", tabs.length),
				accesskey: key,
				"class": "menuitem-iconic bookmark-item menuitem-with-favicon",
				oncommand: "undoCloseWindow(" + i + ");",
				cb_url: url,
				cb_urlDecoded: this.convertURI(url),
				cb_closedAt: undoItem.closedAt || 0,
				cb_index: i,
				cb_type: "window"
			});
			if(this.cm)
				mi.setAttribute("context", this.cmId);
			var icon = selectedTab.image || selectedTab.attributes && selectedTab.attributes.image;
			if(icon)
				mi.setAttribute("image", this.cachedIcon(icon));
			if(i == 0)
				mi.setAttribute("key", "key_undoCloseWindow");
			undoPopup.appendChild(mi);
		}, this);
	},
	addUndoTabsList: function(undoPopup) {
		// Based on code from chrome://browser/content/browser.js
		// Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.3a1pre) Gecko/20090824 Minefield/3.7a1pre

		var keys = this.options.accesskeys.closedTabs;
		this._undoTabItems.forEach(function(undoItem, i) {
			var state = undoItem.state;
			var [key, keyPrefix] = this.getKey(keys, i);
			var title = undoItem.title;
			var url = state && state.entries && state.entries[state.index - 1].url || "";
			var mi = this.createElement("menuitem", {
				label: keyPrefix + title,
				accesskey: key,
				class: "menuitem-iconic bookmark-item menuitem-with-favicon",
				oncommand: "this.parentNode.parentNode.undoCloseTabsList.undoCloseTab(" + i + ");",
				cb_url: url,
				cb_urlDecoded: this.convertURI(url),
				cb_closedAt: undoItem.closedAt || 0,
				cb_index: i,
				cb_type: "tab"
			});
			if(
				state
				&& "attributes" in state
				&& "privateTab-isPrivate" in state.attributes
			) // https://addons.mozilla.org/addon/private-tab/
				mi.setAttribute("privateTab-isPrivate", "true");
			if(this.cm)
				mi.setAttribute("context", this.cmId);
			var image = undoItem.image // Firefox
				|| state && state.attributes && state.attributes.image // SeaMonkey
				|| state && state.xultab
					&& /(?:^| )image=(\S+)/.test(state.xultab)
					&& decodeURI(RegExp.$1); // Only Firefox 2.0 ?
			if(image)
				mi.setAttribute("image", this.cachedIcon(image));
			if(i == 0)
				mi.setAttribute("key", "key_undoCloseTab");
			undoPopup.appendChild(mi);
		}, this);
	},
	getKey: function(keys, i) {
		var key = keys && keys.charAt(i % keys.length);
		var keyPrefix = keys && (key + this.options.accesskeySeparator);
		return [key, keyPrefix];
	},
	checkForMiddleClick: function(e, upd) {
		var mi = e.target;
		if(
			"doCommand" in mi
			&& e.button == 1
			&& mi.parentNode == e.currentTarget
		) {
			mi.doCommand();
			if(upd)
				upd();
			else
				this.drawUndoList();
		}
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
		if(!uri || uri.indexOf("\n") != -1)
			return uri;
		uri = this.losslessDecodeURI(uri);
		return this.crop(uri, crop);
	},
	losslessDecodeURI: function(uri) {
		if(uri) try {
			return this._losslessDecodeURI(uri);
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		return uri;
	},
	get _losslessDecodeURI() {
		var ldu;
		if("losslessDecodeURI" in window)
			ldu = losslessDecodeURI;
		else if("UrlbarInput" in window) // Firefox 75+
			ldu = Components.utils.import("resource:///modules/UrlbarInput.jsm", {}).losslessDecodeURI;
		delete this._losslessDecodeURI;
		return this._losslessDecodeURI = ldu
			? function(uri) {
				return ldu(makeURI(uri));
			}
			: decodeURI;
	},
	cachedIcon: function(src) {
		src = src.replace(/[&#]-moz-resolution=\d+,\d+$/, ""); // Firefox 22+
		if(
			!/^https?:/.test(src)
			// IDN, see https://bugzilla.mozilla.org/show_bug.cgi?id=311045
			|| /^https?:\/\/[^.:\/]+\.[^a-z0-9-]+(?:\/|$)/.test(src) && this.platformVersion < 46
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
	},
	updTooltip: function(tip, tn) {
		var template, header, title, url, closedAt;
		if(tn == this.button) {
			template = this.options.buttonTipTemplate;
			header = _localize("restoreTab");
			let undoTabItems = JSON.parse(this.ss.getClosedTabData(window));
			if(undoTabItems.length) {
				let lastItem = undoTabItems[0];
				title = lastItem.title;
				url = lastItem.state && lastItem.state.entries
					&& lastItem.state.entries[lastItem.state.index - 1].url;
				closedAt = lastItem.closedAt || 0;
			}
		}
		else if(tn.hasAttribute("cb_index")) {
			template = this.options.itemTipTemplate;
			title = tn.getAttribute("label");
			url = tn.getAttribute("cb_url");
			closedAt = +tn.getAttribute("cb_closedAt");
		}
		else {
			return false;
		}

		var tipData = this.getTooltipData(template, header, title, url, closedAt);
		tip.textContent = "";
		tip.appendChild(tipData);
		if(closedAt && template.indexOf("closedAt") != -1) {
			tip.initUpdateTimer(function() {
				var tipData = this.getTooltipData(template, header, title, url, closedAt);
				if(tipData.textContent != tip.textContent) {
					tip.textContent = "";
					tip.appendChild(tipData);
				}
			}, this);
		}
		return tip.hasChildNodes();
	},
	getTooltipData: function(template, header, title, url, closedAt) {
		var df = document.createDocumentFragment();
		var hasHeader = header && template.indexOf("header") != -1;
		function item(key, val) {
			var lbl = document.createElementNS(xulns, "label");
			lbl.className = "cb-" + key + " tooltip-label";
			lbl.textContent = val;
			lbl.setAttribute("maxwidth", "450"); // Trick to restore right border for long lines
			if(key == "closedAt" || hasHeader && key != "header")
				lbl.style.color = "grayText";
			return df.appendChild(lbl);
		}
		template.forEach(function(key) {
			switch(key) {
				case "header":
					if(header)
						item(key, header);
				break;
				case "title":
					if(title && title != url)
						item(key, title);
				break;
				case "url":
					if(url)
						item(key, this.convertURI(url));
				break;
				case "closedAt":
					if(!closedAt)
						break;
					let dt = Math.round(Math.max(0, Date.now() - closedAt)/1000);
					let days = Math.floor(dt/24/3600);
					dt -= days*24*3600;
					let d = new Date((dt + new Date(dt).getTimezoneOffset()*60)*1000);
					let m = d.getMinutes();
					let ts = d.getHours() + ":" + (m > 9 ? m : "0" + m);
					if(days)
						ts = days + _localize("day") + " " + ts;
					let tsTip = _localize("itemTip")
						.replace("%ago", ts)
						.replace("%date", new Date(closedAt).toLocaleString());
					item(key, tsTip);
			}
		}, this);
		return df;
	},
	get wm() {
		delete this.wm;
		return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
	},
	updUIGlobal: function() {
		var isSeaMonkey = this.appName == "SeaMonkey";
		var ws = this.wm.getEnumerator(isSeaMonkey ? null : "navigator:browser");
		const id = this.button.id;
		while(ws.hasMoreElements()) {
			let win = ws.getNext();
			if(isSeaMonkey && !this.isBrowserWindow(win))
				continue;
			let btn = win.document.getElementById(id);
			if(btn && "undoCloseTabsList" in btn) {
				let ucl = btn.undoCloseTabsList;
				ucl.ensureSessionsInitialized(ucl.updUI, ucl);
			}
		}
	},
	isBrowserWindow: function(win) {
		var loc = window.location.href;
		return loc == "chrome://browser/content/browser.xul"
			|| loc == "chrome://navigator/content/navigator.xul";
	},
	ensureSessionsInitialized: function(callback, context) {
		var _this = this;
		var stopTime = Date.now() + 3e3;
		(function ensureInitialized() {
			try {
				_this.ss.getClosedTabCount(window);
				callback.call(context);
				return;
			}
			catch(e) {
				if(Date.now() > stopTime) {
					Components.utils.reportError(
						_this.errPrefix
						+ "Can't initialize: nsISessionStore.getClosedTabCount() failed"
					);
					Components.utils.reportError(e);
					return;
				}
			}
			setTimeout(ensureInitialized, 50);
		})();
	}
};

if(!this.undoCloseTabsList.options.useMenu && this.undoCloseTabsList.useCentextMenu) {
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
if(this.undoCloseTabsList.options.rightClickToUndoCloseTab) {
	this.oncontextmenu = function(e) {
		if(e.target == this && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey)
			e.preventDefault();
	};
}

this.disabled = true;
setTimeout(function(_this) {
	_this.undoCloseTabsList.init();
}, 0, this);

//===================
// Styles
// Used icons from Undo Closed Tabs Button extension

// Styles can't override hardcoded icon
if( // Remove icon only if nsIStyleSheetService works on-the-fly (Firefox 3.0+)
	!Components.ID("{41d979dc-ea03-4235-86ff-1e3c090c5630}")
		.equals(Components.interfaces.nsIStyleSheetService)
) {
	let icon = this.icon
		|| this.ownerDocument.getAnonymousElementByAttribute(this, "class", "toolbarbutton-icon");
	if(icon)
		icon.src = "";
	else
		this.image = "";
}

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
	if(reason == "destructor") // May happens before "unload"
		this.undoCloseTabsList.updUIGlobal();
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