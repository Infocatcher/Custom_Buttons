// http://infocatcher.ucoz.net/js/cb/sessionBookmarks.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57871
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Session_Bookmarks

// Session Bookmarks button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011-2014
// version 0.2.2pre3 - 2014-05-06

// Usage:
//   Use middle-click or left+click with any modifier to add current tab
//   Drag and drop any tab to add new bookmark

// Compatibility: Firefox 3.0+, SeaMonkey 2.0+

// Icon by FatCow Web Hosting: http://www.iconfinder.com/icondetails/36059/16/
// + Diagona Icons http://www.iconfinder.com/icondetails/14111/10/087_icon

var options = {
	hideDropMarker: true, // Hide "v" after button's icon
	showLabel: undefined, // Set to true/false to force show/hide button's label
	addToEnd: true, // Add to end of list by default
	loadInBackground: false, // Load tabs in background
	leftClickCloseMenu: true, // Close menu after left-click
	middleClickCloseMenu: 1,
	// After middle-click:
	// 0 - always stay menu open
	// 1 - close only after click without modifiers
	// 2 - always close
	invertLoadBehavior: false, // true => left-click open bookmark in new tab
	checkDuplicates: true, // Forbid duplicates
	checkDuplicatesSession: true, // Also compare session data
	allowToggleBookmark: false, // Remove already added bookmark using middle-click on button
	deleteAfterOpen: false, // Delete opened bookmarks
	removeAddedTab: false, // Remove tab after bookmark will be added
	replaceCurrentTab: false, // Replace current tab with new one (and preserve position)
	// Workaround, use only in case of problems with "open in current tab" feature
	itemInPageContextMenu: false, // Show "Session Bookmark This Page" item in page context menu
	showNotifications: 1, // Show notifications like "Bookmark added"
	// 0 - don't show
	// 1 - show only if menu is closed
	// 2 - always show
	notificationHideDelay: 1700,

	preloadBookmarks: -1,
	// 0    - disable preload feature (load bookmarks only after menu opening)
	// -1   - preload on mouseover
	// 1..N - preload after this time (in ms)

	useSessions: true, // Save and restore session data
	saveTabHistory: true, // Only for "useSessions: true"
	// Save back/forward history of tab
	saveTabPinnedState: false,
	reloadSessions: true, // Only for "useSessions: true"
	// Ignore cache during session restore (otherwise may be opened obsolete cached version of page)

	undoLimit: 10 // Max length of undo/redo history
};
var _debug = false; // Show debug messages in error/browser console

function _localize(s, key) {
	var strings = {
		"Update": {
			ru: "Обновить"
		},
		updateKey: {
			ru: "н"
		},
		"Update Location": {
			ru: "Обновить адрес"
		},
		updateLocationKey: {
			ru: "а"
		},
		"Delete All Bookmarks": {
			ru: "Удалить все закладки"
		},
		deleteAllKey: {
			ru: "в"
		},

		"Sort": {
			ru: "Сортировать"
		},
		sortKey: {
			ru: "С"
		},
		"By Name, A>Z": {
			ru: "По имени, А>Я"
		},
		sortByNameAZKey: {
			ru: "и"
		},
		"By Name, Z>A": {
			ru: "По имени, Я>А"
		},
		sortByNameZAKey: {
			ru: "и"
		},
		"By Base Domain, Host and Name, A>Z": {
			ru: "По базовому домену, хосту и имени, А>Я"
		},
		sortByBaseDomainHostNameAZKey: {
			ru: "б"
		},
		"By Base Domain, Host and Name, Z>A": {
			ru: "По базовому домену, хосту и имени, Я>А"
		},
		sortByBaseDomainHostNameZAKey: {
			ru: "б"
		},
		"By Host and Name, A>Z": {
			ru: "По хосту и имени, А>Я"
		},
		sortByHostNameAZKey: {
			ru: "х"
		},
		"By Host and Name, Z>A": {
			ru: "По хосту и имени, Я>А"
		},
		sortByHostNameZAKey: {
			ru: "х"
		},

		"Button Menu": {
			ru: "Меню кнопки"
		},
		buttonMenuKey: {
			ru: "М"
		},

		"Session Bookmark This Page": {
			ru: "Добавить страницу в закладки-сессии"
		},
		"Button: %S": {
			ru: "Кнопка: %S"
		},
		pageContextItemKey: {
			ru: "с"
		},

		"Bookmark added": {
			ru: "Закладка добавлена"
		},
		"Bookmarks added: %S": {
			ru: "Закладки добавлены: %S"
		},
		"Bookmark already exists": {
			ru: "Закладка уже существует"
		},
		"Bookmark removed": {
			ru: "Закладка удалена"
		},

		"Session Bookmark Properties": {
			ru: "Свойства закладки-сессии"
		},
		"Warning!": {
			ru: "Внимание!"
		},
		"After location change all session data will be lost!": {
			ru: "После изменения адреса вся информация о сессии будет потеряна!"
		},
		"Icon:": {
			ru: "Иконка:"
		},
		iconKey: {
			ru: "И"
		}
	};
	var locale = (function() {
		var prefs = "Services" in window && Services.prefs
			|| Components.classes["@mozilla.org/preferences-service;1"]
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
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s, key) {
			if(!key)
				key = s;
			return strings[key] && strings[key][locale] || s;
		};
	return _localize.apply(this, arguments);
}

this.onclick = function(e) {
	if(e.target != this)
		return;
	if(e.button == 1 || e.button == 0 && this.bookmarks.hasModifier(e))
		this.bookmarks.addBookmark();
};
this.onmouseover = function(e) {
	if(e.target != this)
		return;
	var preload = this.bookmarks.options.preloadBookmarks;
	if(
		preload == -1
		&& this.bookmarks.mp
		&& this.bookmarks.mp.hasAttribute("onpopupshowing")
	)
		this.bookmarks.loadDelayed();
	if(this.disabled)
		return;
	Array.some(
		this.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != this
				&& node.namespaceURI == xulns
				&& node.boxObject
				// See https://github.com/Infocatcher/Custom_Buttons/issues/28
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
if(!this.hasOwnProperty("defaultContextId"))
	this.defaultContextId = this.getAttribute("context") || "custombuttons-contextpopup";
this.onmousedown = function(e) {
	if(e.target != this || e.button != 2)
		return;
	var showCbMenu = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	if(!showCbMenu)
		this.bookmarks.addContextMenu();
	this.setAttribute("context", showCbMenu ? this.defaultContextId : this.bookmarks.cmId);
};
this.setAttribute("ondraggesture", "return this.bookmarks.handleDragStart(event);");
this.setAttribute("ondragover",    "return this.bookmarks.handleDragOver(event);");
this.setAttribute("ondragexit",    "return this.bookmarks.handleDragExit(event);");
this.setAttribute("ondragdrop",    "return this.bookmarks.handleDrop(event);");

this.bookmarks = {
	button: this,
	options: options,
	errPrefix: "[Custom Buttons :: Session Bookmarks]: ",

	get openAllLabel() {
		var sb = this.$("bundle_browser") || this.$("bundle_navigator");
		if(sb) try {
			var label = sb.getString("menuOpenAllInTabs.label");
		}
		catch(e) {
		}
		delete this.openAllLabel;
		return this.openAllLabel = label || "Open All in Tabs";
	},
	getAttr: function(attr, id, defaultVal) {
		var node = this.$(id);
		return node && node.getAttribute(attr) || defaultVal;
	},
	getLabel: function(id, defaultVal) {
		return this.getAttr("label", id, defaultVal);
	},
	getAccesskey: function(id, defaultVal) {
		return this.getAttr("accesskey", id, defaultVal);
	},

	get ss() {
		delete this.ss;
		return this.ss = (
			Components.classes["@mozilla.org/browser/sessionstore;1"]
			|| Components.classes["@mozilla.org/suite/sessionstore;1"]
		).getService(Components.interfaces.nsISessionStore);
	},
	get ios() {
		delete this.ios;
		return this.ios = Components.classes["@mozilla.org/network/io-service;1"]
			.getService(Components.interfaces.nsIIOService);
	},
	get tld() {
		delete this.tld;
		return this.tld = Components.classes["@mozilla.org/network/effective-tld-service;1"]
			.getService(Components.interfaces.nsIEffectiveTLDService);
	},
	get wm() {
		delete this.wm;
		return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
	},
	get btnNum() {
		delete this.btnNum;
		return this.btnNum = this.button.id.match(/\d*$/)[0];
	},
	get file() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile || Components.interfaces.nsIFile);
		file.append("custombuttons");
		file.append("bookmarks-" + this.btnNum + ".txt");
		file.QueryInterface(Components.interfaces.nsILocalFile || Components.interfaces.nsIFile);
		this.ensureFilePermissions(file, this.PERMS_FILE_OWNER_WRITE);
		delete this.file;
		return this.file = file;
	},
	get backupFile() {
		var file = this.file.clone();
		file.leafName += ".bak";
		file.QueryInterface(Components.interfaces.nsILocalFile || Components.interfaces.nsIFile);
		this.ensureFilePermissions(file, this.PERMS_FILE_OWNER_WRITE);
		delete this.backupFile;
		return this.backupFile = file;
	},
	$: function(id) {
		return document.getElementById(id);
	},

	initProxy: function() {
		// Trick: wait for XBL binding tor [type="menu"]
		_log("initProxy()");
		var btn = this.button;
		if("__initTimer" in btn)
			clearTimeout(btn.__initTimer);
		if(btn.type == "menu") {
			_log("initProxy(): menu");
			this.init();
			return;
		}
		// This behavior may be changed (fixed?) later, so will initialize anyway after small delay
		btn.__initTimer = setTimeout(function(_this) {
			_log("initProxy() -> fallback timer");
			if(btn.type == "menu")
				_this.init();
		}, 500, this);
	},
	init: function() {
		_log("init()");
		window.addEventListener("drop", this, true);
		setTimeout(function(_this) {
			_this.delayedInit();
		}, 0, this);
	},
	delayedInit: function() {
		_log("delayedInit()");
		this.initIds();

		var btn = this.button;
		var mps = btn.getElementsByTagName("menupopup");
		mps.length && mps[0].parentNode.removeChild(mps[0]); // Hack for SeaMonkey
		var mp = this.mp = this.createElement("menupopup", {
			context:        this.cmId,
			oncommand:      "this.parentNode.bookmarks.openBookmark(event);",
			onclick:        "this.parentNode.bookmarks.openBookmark(event);",
			onpopupshowing: "this.parentNode.bookmarks.load();",
			onpopuphidden:  "this.parentNode.bookmarks.checkUnsaved();"
		});
		mp.addEventListener("DOMMenuItemActive",   this, false);
		mp.addEventListener("DOMMenuItemInactive", this, false);
		var tb = btn.parentNode;
		if(tb.getAttribute("orient") == "vertical") {
			// https://addons.mozilla.org/firefox/addon/vertical-toolbar/
			var isRight = tb.parentNode.getAttribute("placement") == "right";
			mp.setAttribute("position", isRight ? "start_before" : "end_before");
		}
		btn.appendChild(mp);

		if(this.options.itemInPageContextMenu) setTimeout(function(_this) {
			_this.initPageContextMenu();
		}, 50, this);

		var preload = this.options.preloadBookmarks;
		if(preload > 0) setTimeout(function(_this) {
			if(_this.mp.hasAttribute("onpopupshowing"))
				_this.load();
		}, preload, this);

		if(this.noBookmarks())
			btn.disabled = true;
	},
	loadDelayed: function(callback) {
		setTimeout(function(_this) {
			_this.load(callback);
		}, 0, this);
	},
	load: function(callback) {
		_log("load()");
		var mp = this.mp;
		if(mp.hasAttribute("onpopupshowing")) {
			// Already called listener can't be removed without this
			mp.setAttribute("onpopupshowing", "");
			mp.removeAttribute("onpopupshowing");
		}
		var file = this.file;
		if(file.exists()) {
			this.readFromFileAsync(file, function(data) {
				this.loadData(data);
				callback && callback();
			}, this);
		}
		else {
			this.loadData("");
			callback && callback();
		}
	},
	ensureLoaded: function(callback, context, args) {
		if(this._loaded)
			return callback.apply(context, args);
		return this.load(function() {
			callback.apply(context, args);
		});
	},

	_label:   "label:   ",
	_uri:     "uri:     ",
	_icon:    "icon:    ",
	_session: "session: ",
	_sep:     "separator",

	_loaded: false,
	loadData: function(data) {
		this._loaded = true;
		this.addContextMenu();

		var mp = this.mp;
		if(mp.hasChildNodes()) {
			_log("loadData(): menupopup isn't empty!");
			mp.textContent = "";
		}
		var typeOffset = this._label.length;
		data.split("\n\n").forEach(function(section, i) {
			if(!section)
				return;
			var label, uri, icon, ssData, isSep;
			section.split("\n").forEach(function(line, i) {
				if(!line)
					return;
				var type = line.substr(0, typeOffset);
				line = line.substr(typeOffset);
				switch(type) {
					case this._label:   label  = line; break;
					case this._uri:     uri    = line; break;
					case this._icon:    icon   = line; break;
					case this._session: ssData = line; break;
					case this._sep:     isSep  = true; return;
				}
			}, this);
			if(isSep)
				mp.appendChild(this.getSeparator());
			else
				mp.appendChild(this.getMenuitem(label, uri, icon, ssData));
		}, this);
		var sep = this.createElement("menuseparator", {
			id: this.sepId
		});
		mp.appendChild(sep);
		var openAll = this.createElement("menuitem", {
			id:    this.openAllId,
			label: this.openAllLabel
		});
		mp.appendChild(openAll);

		this.onBookmarksChanged();
	},
	destroy: function(force) {
		_log("destroy(" + force + ")");
		if(this.mp) {
			this.mp.removeEventListener("DOMMenuItemActive",   this, false);
			this.mp.removeEventListener("DOMMenuItemInactive", this, false);
			if(!force)
				this.closePropertiesWindows();
		}
		if(force) {
			this.closeAllPropertiesWindows();
			this.markInsertionPoint(false);
		}
		if(this.options.itemInPageContextMenu)
			this.destroyPageContextMenu(force);
		window.removeEventListener("drop", this, true);
	},
	handleEvent: function(e) {
		var type = e.type;
		if(type == "popupshowing" && e.target == e.currentTarget)
			this.updatePageContextItemVisibility();
		else if(type == "drop")
			this.handleBookmarkDrop(e);
		else if(type == "DOMMenuItemActive" || type == "DOMMenuItemInactive")
			this.showLink(e);
	},

	initIds: function() {
		this.initIds = function() {};

		var btnId = this.button.id;

		// Bookmarks menu
		this.cmId          = btnId + "-context";
		this.sepId         = btnId + "-separator";
		this.openAllId     = btnId + "-openAll";

		// Bookmarks context menu
		this.addBookmarkId = btnId + "-addBookmark";
		this.addSepId      = btnId + "-addSeparator";

		this.bmAllSepId    = btnId + "-separator-bookmarkAllTabs";
		this.bmAllId       = btnId + "-bookmarkAllTabs";

		this.updateSepId   = btnId + "-separator-update";
		this.updateId      = btnId + "-update";
		this.updateURIId   = btnId + "-updateURI";

		this.deleteSepId   = btnId + "-separator-delete";
		this.deleteId      = btnId + "-delete";
		this.deleteAllId   = btnId + "-deleteAll";

		this.sortSepId     = btnId + "-separator-sort";
		this.sortId        = btnId + "-sort";

		this.undoId        = btnId + "-undo";
		this.redoId        = btnId + "-redo";

		this.propsSepId    = btnId + "-separator-properties";
		this.propsId       = btnId + "-properties";

		this.btnMenuSepId  = btnId + "-separator-buttonMenu";
		this.btnMenuId     = btnId + "-buttonMenu";
	},
	addContextMenu: function() {
		_log("addContextMenu()");
		this.addContextMenu = function() {};

		var cm = this.$(this.cmId);
		cm && cm.parentNode.removeChild(cm);
		cm = this.cm = this.parseXULFromString('\
			<menupopup xmlns="' + xulns + '"\
				id="' + this.cmId + '"\
				onpopupshowing="\
					if(event.target != this)\
						return true;\
					document.popupNode = this.parentNode.triggerNode || document.popupNode;\
					return this.bookmarks.initContextMenu(this.parentNode.triggerNode || document.popupNode);"\
				onpopuphidden="if(event.target == this) document.popupNode = null;">\
				<menuitem id="' + this.addBookmarkId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.addBookmark(this.parentNode.triggerNode || document.popupNode);"\
					label="' + this.getLabel("placesContext_new:bookmark", "New Bookmark").replace(/…$/, "") + '"\
					accesskey="' + this.getAccesskey("placesContext_new:bookmark", "B") + '" />\
				<menuitem id="' + this.addSepId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.addSeparator(this.parentNode.triggerNode || document.popupNode);"\
					label="' + this.getLabel("placesContext_new:separator", "New Separator") + '"\
					accesskey="' + this.getAccesskey("placesContext_new:separator", "S") + '" />\
				\
				<menuseparator id="' + this.bmAllSepId + '" />\
				<menuitem id="' + this.bmAllId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.bookmarkAllTabs(this.parentNode.triggerNode || document.popupNode);"\
					label="' + this.getLabel("context_bookmarkAllTabs", "Bookmark All Tabs…") + '"\
					accesskey="' + this.getAccesskey("context_bookmarkAllTabs", "T") + '" />\
				\
				<menuseparator id="' + this.updateSepId + '" />\
				<menuitem id="' + this.updateId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.updateBookmark(this.parentNode.triggerNode || document.popupNode);"\
					label="' + _localize("Update") + '"\
					accesskey="' + _localize("p", "updateKey") + '" />\
				<menuitem id="' + this.updateURIId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.updateBookmark(this.parentNode.triggerNode || document.popupNode, true);"\
					label="' + _localize("Update Location") + '"\
					accesskey="' + _localize("L", "updateLocationKey") + '" />\
				\
				<menuseparator id="' + this.deleteSepId + '" />\
				<menuitem id="' + this.deleteId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.deleteBookmark(this.parentNode.triggerNode || document.popupNode);"\
					label="' + this.getLabel("placesContext_delete", "Delete") + '"\
					accesskey="' + this.getAccesskey("placesContext_delete", "D") + '" />\
				<menuitem id="' + this.deleteAllId + '"\
					oncommand="this.parentNode.bookmarks.deleteAllBookmarks();"\
					label="' + _localize("Delete All Bookmarks") + '"\
					accesskey="' + _localize("A", "deleteAllKey") + '" />\
				\
				<menuseparator id="' + this.sortSepId + '" />\
				<menu id="' + this.sortId + '"\
					label="' + _localize("Sort") + '"\
					accesskey="' + _localize("S", "sortKey") + '">\
					<menupopup>\
						<menuitem\
							closemenu="single"\
							oncommand="this.parentNode.parentNode.parentNode.bookmarks.sortBookmarks([\'name\']);"\
							label="' + _localize("By Name, A>Z") + '"\
							accesskey="' + _localize("N", "sortByNameAZKey") + '" />\
						<menuitem\
							closemenu="single"\
							oncommand="this.parentNode.parentNode.parentNode.bookmarks.sortBookmarks([\'name\'], true);"\
							label="' + _localize("By Name, Z>A") + '"\
							accesskey="' + _localize("N", "sortByNameZAKey") + '" />\
						<menuseparator />\
						<menuitem\
							closemenu="single"\
							oncommand="this.parentNode.parentNode.parentNode.bookmarks.sortBookmarks([\'baseDomain\', \'host\', \'name\']);"\
							label="' + _localize("By Base Domain, Host and Name, A>Z") + '"\
							accesskey="' + _localize("B", "sortByBaseDomainHostNameAZKey") + '" />\
						<menuitem\
							closemenu="single"\
							oncommand="this.parentNode.parentNode.parentNode.bookmarks.sortBookmarks([\'baseDomain\', \'host\', \'name\'], true);"\
							label="' + _localize("By Base Domain, Host and Name, Z>A") + '"\
							accesskey="' + _localize("B", "sortByBaseDomainHostNameZAKey") + '" />\
						<menuseparator />\
						<menuitem\
							closemenu="single"\
							oncommand="this.parentNode.parentNode.parentNode.bookmarks.sortBookmarks([\'host\', \'name\']);"\
							label="' + _localize("By Host and Name, A>Z") + '"\
							accesskey="' + _localize("H", "sortByHostNameAZKey") + '" />\
						<menuitem\
							closemenu="single"\
							oncommand="this.parentNode.parentNode.parentNode.bookmarks.sortBookmarks([\'host\', \'name\'], true);"\
							label="' + _localize("By Host and Name, Z>A") + '"\
							accesskey="' + _localize("H", "sortByHostNameZAKey") + '" />\
					</menupopup>\
				</menu>\
				\
				<menuseparator />\
				<menuitem id="' + this.undoId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.undo();"\
					label="' + this.getLabel("menu_undo", this.getLabel("cmd_undo", "Undo")) + '"\
					accesskey="' + this.getAccesskey("menu_undo", "U") + '" />\
				<menuitem id="' + this.redoId + '"\
					closemenu="single"\
					oncommand="this.parentNode.bookmarks.redo();"\
					label="' + this.getLabel("menu_redo", this.getLabel("cmd_redo", "Redo")) + '"\
					accesskey="' + this.getAccesskey("menu_redo", "R") + '" />\
				\
				<menuseparator id="' + this.propsSepId + '" />\
				<menuitem id="' + this.propsId + '"\
					oncommand="this.parentNode.bookmarks.properties(this.parentNode.triggerNode || document.popupNode);"\
					label="' + this.getLabel("placesContext_show:info", "Properties") + '"\
					accesskey="' + this.getAccesskey("placesContext_show:info", "i") + '" />\
				\
				<menuseparator id="' + this.btnMenuSepId + '" />\
				<menu id="' + this.btnMenuId + '"\
					label="' + _localize("Button Menu") + '"\
					accesskey="' + _localize("M", "buttonMenuKey") + '" />\
			</menupopup>'
		);

		var cbPopup = this.$(this.button.defaultContextId);
		if(!cbPopup)
			Components.utils.reportError(this.errPrefix + "cb menu not found");
		else {
			cbPopup = cbPopup.cloneNode(true);
			let id = "-" + this.btnNum + "-cloned";
			cbPopup.id += id;
			Array.slice(cbPopup.getElementsByAttribute("id", "*")).forEach(function(node) {
				node.id += id;
			});
			let menu = cm.lastChild;
			menu.appendChild(cbPopup);
		}

		cm.bookmarks = this;
		this.$("mainPopupSet").appendChild(cm);
	},

	_hasPageContextItem: false,
	get pageContextItem() {
		this._hasPageContextItem = true;
		var cbId = "sessionBookmarksPageContextItem";
		var btnId = this.button.id;
		Array.slice(document.getElementsByAttribute("cb_buttonId", btnId)).forEach(function(mi) {
			mi.parentNode.removeChild(mi);
		});
		var mi = this.createElement("menuitem", {
			label: _localize("Session Bookmark This Page"),
			accesskey: _localize("S", "pageContextItemKey"),
			tooltiptext: _localize("Button: %S")
				.replace("%S", this.button.tooltipText || this.button.label),
			oncommand: "this._bookmarks.addBookmark();",
			cb_id: cbId,
			cb_buttonId: btnId
		});
		mi._bookmarks = this;
		var insPoint = this.bmItem.nextSibling;
		while(insPoint && insPoint.getAttribute("cb_id") == cbId)
			insPoint = insPoint.nextSibling;
		this.bmPopup.insertBefore(mi, insPoint);
		delete this.pageContextItem;
		return this.pageContextItem = mi;
	},
	initPageContextMenu: function() {
		var bmItem = this.bmItem = this.$("context-bookmarkpage");
		if(!bmItem)
			return;
		_log("initPageContextMenu()");
		var bmPopup = this.bmPopup = bmItem.parentNode;
		bmPopup.addEventListener("popupshowing", this, true);
	},
	destroyPageContextMenu: function(force) {
		_log("destroyPageContextMenu()");
		this.bmPopup.removeEventListener("popupshowing", this, true);
		if(force && this._hasPageContextItem && this.pageContextItem.parentNode)
			this.bmPopup.removeChild(this.pageContextItem);
	},
	updatePageContextItemVisibility: function() {
		var hidden = this.bmItem.hidden;
		if(
			!hidden
			&& gContextMenu
			&& gContextMenu.target
			&& gContextMenu.target.ownerDocument.defaultView.top != content
		)
			hidden = true;
		this.pageContextItem.hidden = hidden;
	},

	reload: function(data) {
		this.mp.textContent = "";
		this._undoStorage.length = 0;
		this._undoPos = undefined;
		if(data == undefined)
			this.init();
		else
			this.loadData(data);
	},
	unsaved: false,
	_saveInProgress: false,
	_changed: false,
	save: function() {
		if(this._saveInProgress) {
			this._changed = true;
			return;
		}
		this._saveInProgress = true;
		this._changed = false;

		var data = [];
		Array.forEach(
			this.mp.getElementsByAttribute("cb_bookmarkItem", "*"),
			function(mi) {
				if(mi.localName == "menuseparator") {
					data.push(this._sep);
					return;
				}
				var section = [
					this._label + this.escapeString(mi.getAttribute("label")),
					this._uri   + this.escapeString(mi.getAttribute("cb_uri"))
				];
				var icon   = mi.getAttribute("image");
				var ssData = mi.getAttribute("cb_ssData");
				icon   && section.push(this._icon    + this.escapeString(icon));
				ssData && section.push(this._session + this.escapeString(ssData));
				data.push(section.join("\n"));
			},
			this
		);
		this.copyFileAsync(this.file, this.backupFile, function(status) {
			if(!Components.isSuccessCode(status))
				Components.utils.reportError(this.errPrefix + "copyFileAsync() failed");
			// Backup failed? But we still can try save user data.
			this.writeToFileAsync(data.join("\n\n"), this.file, function(status, data) {
				if(!Components.isSuccessCode(status))
					Components.utils.reportError(this.errPrefix + "writeToFileAsync() failed");
				else {
					// Private windows in SeaMonkey doesn't have "windowtype"
					let isSeaMonkey = this.appName == "SeaMonkey";
					let ws = this.wm.getEnumerator(isSeaMonkey ? null : "navigator:browser");
					while(ws.hasMoreElements()) {
						let w = ws.getNext();
						if(w == window)
							continue;
						let btn = w.document.getElementById(this.button.id);
						if(btn && btn.bookmarks) w.setTimeout(function(btn) {
							btn.bookmarks.reload(data);
						}, 0, btn);
					}
				}
				this._saveInProgress = false;
				if(this._changed) setTimeout(function(_this) {
					_this.save();
				}, 0, this);
			}, this);
		}, this);
		this.unsaved = false;
	},
	scheduleSave: function() {
		if(this.button.open || this.button.getAttribute("open") == "true")
			this.unsaved = true;
		else
			this.save();
	},
	checkUnsaved: function() {
		this.unsaved && this.save();
	},
	getMenuitem: function(label, uri, icon, ssData) {
		if(!ssData)
			ssData = "";
		var mi = this.createElement("menuitem", {
			"class": "menuitem-iconic bookmark-item menuitem-with-favicon",
			closemenu: this.options.leftClickCloseMenu ? "auto" : "none",
			label: label || "",
			cb_uri: uri || "",
			cb_ssData: ssData,
			tooltiptext: this.decodeURI(uri || ""),
			image: icon || "",
			cb_bookmarkItem: "true"
		});
		// Faster way to check for "privateTab-isPrivate" in JSON.parse(ssData).attributes
		if(ssData.indexOf('"privateTab-isPrivate":"true"') > 0)
			mi.setAttribute("privateTab-isPrivate", "true");
		return mi;
	},
	decodeURI: function(uri) {
		try {
			return losslessDecodeURI({ spec: uri });
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		return uri;
	},
	getSeparator: function() {
		return this.createElement("menuseparator", {
			cb_bookmarkItem: "true"
		});
	},
	tabData: function(o) {
		if(o) for(var p in o) if(o.hasOwnProperty(p))
			this[p] = o[p];
	},
	getTabData: function(tab) {
		if(tab instanceof this.tabData)
			return tab;
		if(!tab)
			tab = gBrowser.selectedTab;
		if(this.options.useSessions) {
			var ssData = this.getTabState(tab);
			if("JSON" in window) try {
				let data = JSON.parse(ssData);
				if(!this.options.saveTabHistory) {
					data.entries = [data.entries[data.index - 1]];
					data.index = 1;
				}
				this.cleanupSessionData(data);
				ssData = JSON.stringify(data);
			}
			catch(e) {
				Components.utils.reportError(this.errPrefix + "getTabData: session data tweaks failed");
				Components.utils.reportError(e);
			}
		}
		return new this.tabData({
			label:  tab.label,
			uri:    tab.linkedBrowser && tab.linkedBrowser.currentURI.spec,
			icon:   this.cachedIcon(tab.image),
			ssData: ssData,
			tab:    tab
		});
	},
	getTabState: function(tab) {
		this.cleanupTabStateCache(tab);
		return this.ss.getTabState(tab);
	},
	cleanupTabStateCache: function(tab) {
		// Inspired by code from UnloadTab extension
		// https://addons.mozilla.org/files/compare/233879...223485/file/chrome/content/unloadtab.js#L928
		// Try flush cached data for tab to get correct scroll position
		var scope = this.ssTabCacheScope;
		if(scope && "TabStateCache" in scope && "delete" in scope.TabStateCache) try {
			scope.TabStateCache.delete(tab);
			return true;
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		_log("clearTabStateCache() failed!");
		return false;
	},
	get ssTabCacheScope() {
		var scope;
		try { // Firefox 28+
			scope = Components.utils.import("resource:///modules/sessionstore/TabStateCache.jsm", {});
		}
		catch(e) {
		}
		if(!scope || !("TabStateCache" in scope)) try {
			scope = Components.utils.import("resource:///modules/sessionstore/SessionStore.jsm", {});
		}
		catch(e) {
		}
		if(scope && !("TabStateCache" in scope))
			scope = null;
		delete this.ssTabCacheScope;
		return this.ssTabCacheScope = scope;
	},
	cleanupSessionData: function(data) {
		if(!data)
			return;
		//_log("cleanupSessionData:\n" + JSON.stringify(data, null, "  "));
		if(!this.options.saveTabPinnedState)
			delete data.pinned;
		if("extData" in data) {
			let extData = data.extData;
			if(extData && typeof extData == "object") {
				// Built-in Panorama
				delete extData["tabview-tab"];

				// Tree Style Tab https://addons.mozilla.org/firefox/addon/tree-style-tab/
				delete extData["treestyletab-id"];
				delete extData["treestyletab-children"];
				delete extData["treestyletab-parent"];
				delete extData["treestyletab-ancestors"];
				delete extData["treestyletab-nest"];
				delete extData["treestyletab-insert-before"];
				delete extData["treestyletab-insert-after"];
				delete extData["treestyletab-closed-set-id"];

				delete extData["treestyletab-id-new"];
				delete extData["treestyletab-id-restoring"];
				delete extData["treestyletab-children-restoring"];

				delete extData["treestyletab-collapsed"];

				// Tab Utilities https://addons.mozilla.org/firefox/addon/tab-utilities/
				delete extData.group;
				delete extData["group-color"];
				delete extData["group-collapsed"];
				delete extData["group-counter"];
			}
		}
		if("attributes" in data) {
			let attrs = data.attributes;
			if(attrs && typeof attrs == "object") {
				// TabKit 2nd Edition https://addons.mozilla.org/firefox/addon/tabkit-2nd-edition/
				delete attrs.tabid;
				delete attrs.possibleparent;
				delete attrs.outoforder;
				delete attrs.uriKey;
				delete attrs.groupid;
				delete attrs.openerGroup;
				delete attrs.uriGroup;
			}
		}
	},
	getItemByTabData: function(td, checkSession) {
		var mis = this.mp.getElementsByAttribute("cb_uri", td.uri);
		var mi = mis.length && mis[0];
		if(
			mi
			&& mi.getAttribute("label") == td.label
			&& mi.getAttribute("image") == td.icon
			&& (
				!checkSession
				|| !this.options.useSessions
				|| mi.getAttribute("cb_ssData") == td.ssData
			)
		)
			return mi;
		return null;
	},
	addBookmark: function() {
		return this.ensureLoaded(this._addBookmark, this, arguments);
	},
	_addBookmark: function(insPoint, tab, undoBuffer) {
		var canToggle = this.options.allowToggleBookmark
			&& (!insPoint || insPoint == this.button);
		var td = this.getTabData(tab);
		if(canToggle || this.options.checkDuplicates) {
			let checkSession = canToggle
				? false
				: this.options.checkDuplicatesSession;
			let mi = this.getItemByTabData(td, checkSession);
			if(mi) {
				if(canToggle) {
					this.blink(this.button, 0.05);
					this.notify(_localize("Bookmark removed"));
					this.deleteBookmark(mi);
					return null;
				}
				this.blink(mi, 0.5);
				this.notify(_localize("Bookmark already exists"));
				return null;
			}
		}
		var mi = this.getMenuitem(td.label, td.uri, td.icon, td.ssData);
		this.mp.insertBefore(mi, this.correctInsPoint(insPoint));
		var undo = { action: "remove", mi: mi, pn: mi.parentNode, ns: mi.nextSibling };
		if(undoBuffer)
			undoBuffer.push(undo);
		else {
			this.addUndo(undo);
			this.onBookmarksChanged(true);
			this.blink();
			this.notify(_localize("Bookmark added"));
			this.scheduleSave();
		}
		if(this.options.removeAddedTab) setTimeout(function() {
			var tab = td.tab;
			if(!tab.parentNode) // Already closed?
				return;
			// Browser may be closed with last tab, so will add new empty tab
			var tabs = gBrowser.visibleTabs || gBrowser.tabs || gBrowser.tabContainer.childNodes;
			if(tabs.length <= 1)
				BrowserOpenTab();
			gBrowser.removeTab(tab);
		}, 0);
		return mi;
	},
	addSeparator: function(insPoint) {
		var sep = this.getSeparator();
		this.mp.insertBefore(sep, this.correctInsPoint(insPoint));
		this.addUndo({ action: "remove", mi: sep, pn: sep.parentNode, ns: sep.nextSibling });
		this.scheduleSave();
		return sep;
	},
	bookmarkAllTabs: function() {
		return this.ensureLoaded(this._bookmarkAllTabs, this, arguments);
	},
	_bookmarkAllTabs: function(insPoint) {
		var undo = [];
		var tabs = gBrowser.visibleTabs || gBrowser.tabs || gBrowser.tabContainer.childNodes;
		Array.forEach(tabs, function(tab) {
			var mi = this._addBookmark(insPoint, tab, undo);
			if(mi)
				insPoint = mi.nextSibling || mi;
		}, this);
		if(!undo.length)
			return;
		this.addUndo({ action: "removes", actions: undo.reverse() });
		this.onBookmarksChanged(true);
		this.blink();
		this.notify(_localize("Bookmarks added: %S").replace("%S", undo.length));
		this.scheduleSave();
	},
	correctInsPoint: function(insPoint) {
		if(!insPoint || insPoint.parentNode != this.mp)
			return this.defaultInsPoint;
		if(insPoint.id == this.openAllId)
			return this.$(this.sepId);
		return insPoint;
	},
	get defaultInsPoint() {
		return this.options.addToEnd
			? this.$(this.sepId)
			: this.mp.firstChild;
	},
	updateBookmark: function(mi, onlyURI) {
		var oldAttrs = this.getAttributes(mi);
		var td = this.getTabData();
		mi.setAttribute("cb_uri",      td.uri);
		mi.setAttribute("tooltiptext", td.uri);
		mi.setAttribute("cb_ssData",   td.ssData || "");
		if(!onlyURI) {
			mi.setAttribute("label", td.label);
			mi.setAttribute("image", td.icon);
		}
		var newAttrs = this.getAttributes(mi);
		this.addUndo({ action: "attrs", mi: mi, oldAttrs: oldAttrs, newAttrs: newAttrs });
		this.scheduleSave();
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
	rawIcon: function(src) {
		return src.replace(/^moz-anno:favicon:/, "");
	},
	blink: function(node, opacity) {
		if(!node)
			node = this.button;
		var stl = node.style;
		var transition = "transition" in stl && "transition"
			|| "MozTransition" in stl && "MozTransition";
		stl[transition] = "opacity 0.1s ease-in";
		stl.opacity = opacity || 0.72;
		setTimeout(function() {
			stl.opacity = "";
			setTimeout(function() {
				stl[transition] = "";
			}, 150);
		}, 250);
	},
	notify: function(msg) {
		if(
			!this.options.showNotifications
			|| this.options.showNotifications == 1 && this.button.open
		)
			return;
		if("_notifyTip" in this)
			this._notifyTip.hidePopup();
		var tip = this._notifyTip = document.createElement("tooltip");
		tip.className = "sessionBookmarks-notifyTip";
		tip.setAttribute("label", msg);
		tip.setAttribute("onmouseover", "this.hidePopup();");
		var stl = tip.style;
		stl.opacity = 0.6;
		document.documentElement.appendChild(tip);

		tip.openPopup(this.button, "end_after");
		setTimeout(function() {
			var transition = "transition" in stl && "transition"
				|| "MozTransition" in stl && "MozTransition";
			stl[transition] = "opacity 0.15s ease-in";
			stl.opacity = "";
		}, 0);
		setTimeout(function(_this) {
			tip.hidePopup();
			tip.parentNode.removeChild(tip);
			delete _this._notifyTip;
		}, this.options.notificationHideDelay, this);
	},
	openBookmark: function(e) {
		var mi = e.target;
		if(mi.id == this.openAllId) {
			if(e.type == "command")
				this.openAllBookmarks();
			return;
		}
		if(e.type == "click" && e.button != 1)
			return;
		var uri = mi.getAttribute("cb_uri");
		if(!uri) // Separator?
			return;

		var loadInNewTab = this.options.invertLoadBehavior
			? e.type == "command" || e.shiftKey
			: e.type == "click" || this.hasModifier(e);

		if(loadInNewTab) {
			var tab = gBrowser.addTab(this.options.useSessions ? "about:blank" : uri);
			if(!(this.options.loadInBackground ^ e.shiftKey))
				gBrowser.selectedTab = tab;
		}
		else {
			if(!this.options.useSessions)
				loadURI(uri);
			var tab = gBrowser.selectedTab;
			var mergeHistory = true;
		}

		if(
			e.type == "click"
			&& (
				this.options.middleClickCloseMenu == 1 && !this.hasModifier(e)
				|| this.options.middleClickCloseMenu == 2
			)
		)
			closeMenus(mi);

		if(tab && this.options.useSessions)
			this.setTabSession(tab, mi.getAttribute("cb_ssData"), uri, mergeHistory);

		if(this.options.deleteAfterOpen)
			this.deleteBookmark(mi);
	},
	openAllBookmarks: function() {
		var mis = this.mp.getElementsByAttribute("cb_uri", "*");
		if(
			"PlacesUIUtils" in window
			&& "_confirmOpenInTabs" in PlacesUIUtils
			&& mis.length
		) try {
			if(!PlacesUIUtils._confirmOpenInTabs(mis.length, window))
				return;
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		Array.forEach(
			mis,
			function(mi) {
				var uri = mi.getAttribute("cb_uri");
				var tab = gBrowser.addTab(this.options.useSessions ? "about:blank" : uri);
				if(this.options.useSessions)
					this.setTabSession(tab, mi.getAttribute("cb_ssData"), uri, false, true);
			},
			this
		);
		if(this.options.deleteAfterOpen)
			this.deleteAllBookmarks();
	},
	setTabSession: function(tab, ssData, uri, mergeHistory, disableForceLoad) {
		var data;
		if(ssData && "JSON" in window) try {
			data = JSON.parse(ssData);
			// For better compatibility with Private Tab extension
			let privateAttr = "privateTab-isPrivate";
			let isPrivate = "PrivateBrowsingUtils" in window
				&& PrivateBrowsingUtils.isWindowPrivate(tab.linkedBrowser.contentWindow)
				|| tab.hasAttribute(privateAttr);
			if(isPrivate) {
				if(!data.attributes)
					data.attributes = {};
				data.attributes[privateAttr] = "true";
			}
			if(mergeHistory) {
				let oldData = JSON.parse(this.getTabState(gBrowser.selectedTab));
				let tabHistory = oldData.entries.slice(0, oldData.index);
				if(tabHistory[tabHistory.length - 1].url == "about:blank")
					tabHistory.pop();
				if(!data.entries.length) // We can get object here
					data.entries = [data.entries];
				if(tabHistory.length) {
					let docshellID = tabHistory[0].docshellID;
					data.entries.forEach(function(entry) {
						entry.docshellID = docshellID;
					});
				}
				data.entries = tabHistory.concat(data.entries);
				data.index += tabHistory.length;
				if(this.options.replaceCurrentTab && tab == gBrowser.selectedTab) {
					let blankTab = gBrowser.addTab("about:blank", { skipAnimation: true });
					blankTab.linkedBrowser.stop();
					gBrowser.moveTabTo(blankTab, gBrowser.tabContainer.selectedIndex + 1);
					gBrowser.selectedTab = blankTab;
					gBrowser.removeTab(tab, { animate: false });
					tab = blankTab;
				}
			}
			this.cleanupSessionData(data); // Only for already saved unwanted data...
			ssData = JSON.stringify(data);
		}
		catch(e) {
			Components.utils.reportError(this.errPrefix + "setTabSession: can't parse session data");
			Components.utils.reportError(e);
		}
		function fallback() {
			uri && tab.linkedBrowser.loadURI(uri);
		}
		if(!ssData) {
			fallback();
			return;
		}
		// Note: we always use progress listener to test <xul:browser>
		var progressListener = this.progressListener;
		progressListener.enabled = this.options.reloadSessions && !this.ios.offline;
		var stopTime = Date.now() + 1e3;
		var _this = this;
		(function trySetSession() {
			try {
				tab.linkedBrowser.addProgressListener(progressListener);
			}
			catch(e) {
				_info("setTabSession: addProgressListener() failed, error:\n" + e);
				if(Date.now() < stopTime)
					setTimeout(trySetSession, 5);
				else {
					Components.utils.reportError(_this.errPrefix + "setTabSession: addProgressListener() failed");
					Components.utils.reportError(e);
					fallback();
				}
				return;
			}
			try {
				var browser = tab.linkedBrowser;
				var entriesCount = data && data.entries && data.entries.length;
				if(entriesCount) {
					var sh = browser.sessionHistory
						.QueryInterface(Components.interfaces.nsISHistory);
					var maxLength = sh.maxLength;
					if(entriesCount > maxLength) {
						_log("Override nsISHistory.maxLength: " + maxLength + " -> " + entriesCount);
						sh.maxLength = entriesCount;
					}
				}
				_this.ss.setTabState(tab, ssData);
				if(
					!disableForceLoad
					&& tab != gBrowser.selectedTab // Should be loaded automatically in this case
					&& (
						tab.getAttribute("pending") == "true" // Gecko >= 9.0
						|| browser.contentDocument.readyState == "uninitialized"
						// || browser.__SS_restoreState == 1
					)
				) {
					browser.reload();
					// Show "Connecting…" instead of "New Tab"
					// (disable browser.sessionstore.restore_on_demand to see this bug)
					gBrowser.setTabTitleLoading && gBrowser.setTabTitleLoading(tab);
				}
			}
			catch(e) {
				Components.utils.reportError(_this.errPrefix + "setTabSession: setTabState() failed");
				Components.utils.reportError(e);
				fallback();
			}
			finally {
				if(entriesCount && sh.maxLength != maxLength) setTimeout(function() {
					_log("Restore nsISHistory.maxLength: " + sh.maxLength + " -> " + maxLength);
					sh.maxLength = maxLength;
				}, 100);
			}
		})();
	},
	progressListener: { // Based on code of Session Manager 0.7.5
		enabled: true,
		QueryInterface: function(aIID) {
			if(
				aIID.equals(Components.interfaces.nsIWebProgressListener)
				|| aIID.equals(Components.interfaces.nsISupportsWeakReference)
				|| aIID.equals(Components.interfaces.nsISupports)
			)
				return this;
			throw Components.results.NS_NOINTERFACE;
		},
		onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
			if(!this.enabled)
				return;
			try {
				if(aRequest.name == "about:blank")
					return;
			}
			catch(e) { // view-source: protocol
				if(e.name != "NS_ERROR_NOT_IMPLEMENTED")
					Components.utils.reportError(e);
			}
			var wpl = Components.interfaces.nsIWebProgressListener;
			if(aFlag & wpl.STATE_START) // Force load to bypass cache
				aRequest.loadFlags |= aRequest.LOAD_BYPASS_CACHE;
			else if(aFlag & wpl.STATE_STOP && aFlag & wpl.STATE_IS_NETWORK) {
				let ceh = aWebProgress.chromeEventHandler;
				ceh.removeProgressListener && ceh.removeProgressListener(this);
			}
		},
		onLocationChange: function(aProgress, aRequest, aURI) {},
		onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
		onStatusChange:   function(aWebProgress, aRequest, aStatus, aMessage) {},
		onSecurityChange: function(aWebProgress, aRequest, aState) {}
	},
	deleteBookmark: function(mi) {
		this.addUndo({ action: "add", mi: mi, pn: mi.parentNode, ns: mi.nextSibling });
		mi.parentNode.removeChild(mi);
		this.closePropertiesWindow(mi);
		this.onBookmarksChanged();
		this.scheduleSave();
	},
	deleteAllBookmarks: function() {
		var undo = [];
		Array.slice(this.mp.getElementsByAttribute("cb_bookmarkItem", "*")).forEach(function(mi) {
			undo.push({ action: "add", mi: mi, pn: mi.parentNode, ns: mi.nextSibling });
			mi.parentNode.removeChild(mi);
		});
		this.closeAllPropertiesWindows();
		this.addUndo({ action: "adds", actions: undo.reverse() });
		this.save();
		this.onBookmarksChanged(false);
	},
	_undoStorage: [],
	_undoPos: undefined,
	addUndo: function(o) {
		var us = this._undoStorage;
		if(this._undoPos != undefined) {
			us.length = this._undoPos + 1;
			this._undoPos = undefined;
		}
		us.push(o);
		if(us.length > this.options.undoLimit)
			us.shift();
	},
	undo: function(check) {
		return this.undoRedo(-1, check);
	},
	redo: function(check) {
		return this.undoRedo(1, check);
	},
	undoRedo: function(action, check) {
		var us = this._undoStorage;
		if(!us.length)
			return false;
		var redo = action > 0;
		var pos;
		if(this._undoPos == undefined) {
			if(redo)
				return false;
			pos = us.length - 1;
		}
		else {
			if(redo)
				pos = this._undoPos + 1;
			else
				pos = this._undoPos;
		}
		if(pos < 0 || pos >= us.length)
			return false;
		if(check)
			return true;
		this.undoRedoAction(us[pos], redo);
		this._undoPos = redo ? pos : pos - 1;
		this.onBookmarksChanged();
		this.scheduleSave();
		return true;
	},
	undoRedoAction: function(o, invert) {
		var action = o.action;
		if(invert) {
			if(action == "remove")
				action = "add";
			else if(action == "add")
				action = "remove";
		}
		try {
			if(action == "remove") {
				o.pn.removeChild(o.mi);
				this.closePropertiesWindow(o.mi);
			}
			else if(action == "add")
				o.pn.insertBefore(o.mi, o.ns);
			else if(action == "attrs") {
				let mi = o.mi;
				Array.slice(mi.attributes).forEach(function(attr) {
					mi.removeAttributeNS(attr.namespaceURI, attr.name);
				});
				(invert ? o.newAttrs : o.oldAttrs).forEach(function(attr) {
					mi.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
				});
			}
			else if(action == "move")
				o.mi.parentNode.insertBefore(o.mi, invert ? o.newPos : o.oldPos);
			else if(
				action == "adds"
				|| action == "moves"
				|| action == "removes"
			) {
				let actions = o.actions;
				if(invert)
					actions = o.actions.slice().reverse();
				actions.forEach(function(o) {
					this.undoRedoAction(o, invert);
				}, this);
			}
		}
		catch(e) {
			Components.utils.reportError(
				this.errPrefix + "undoRedoAction failed"
				+ "\nData: " + uneval(o) + "\nIndert: " + invert
			);
			Components.utils.reportError(e);
		}
	},
	getAttributes: function(node) {
		return Array.slice(node.attributes).map(function(attr) {
			return { // Simple way to get immutable copy
				namespaceURI: attr.namespaceURI,
				name:         attr.name,
				value:        attr.value
			};
		});
	},
	properties: function(mi) {
		var win = this.getPropertiesWindow(mi);
		if(win) {
			win.focus();
			return;
		}
		// See chrome://browser/content/places/editBookmarkOverlay.xul
		var bookmarksDTD = this.appName == "SeaMonkey"
			? "chrome://communicator/locale/bookmarks/editBookmarkOverlay.dtd"
			: "chrome://browser/locale/places/editBookmarkOverlay.dtd";
		var dialog = '\
			<?xml version="1.0"?>\n\
			<?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\n\
			<!DOCTYPE dialog SYSTEM "' + bookmarksDTD + '">\n\
			<dialog xmlns="' + xulns + '"\n\
				id="' + this.button.id + "-propertiesDialog" + '"\n\
				windowtype="' + this.button.id + ":propertiesDialog" + '"\n\
				title="' + _localize("Session Bookmark Properties") + '"\n\
				buttons="accept,cancel"\n\
				ondialogaccept="return dialogCallback();"\n\
				width="460"\n\
				persist="screenX screenY width height">\n\
				<grid>\n\
					<columns>\n\
						<column />\n\
						<column flex="1" style="min-width: 160px;" />\n\
					</columns>\n\
					<rows>\n\
						<row align="center">\n\
							<label control="label"\n\
								value="&editBookmarkOverlay.name.label;"\n\
								accesskey="&editBookmarkOverlay.name.accesskey;" />\n\
							<textbox id="label" />\n\
						</row>\n\
						<row align="center">\n\
							<box>\n\
								<label control="uri"\n\
									value="&editBookmarkOverlay.location.label;"\n\
									accesskey="&editBookmarkOverlay.location.accesskey;" />\n\
							</box>\n\
							<textbox id="uri" />\n\
						</row>\n\
						<row align="center">\n\
							<label control="icon"\n\
								value="' + _localize("Icon:") + '"\n\
								accesskey="' + _localize("I", "iconKey") + '" />\n\
							<textbox id="icon" />\n\
						</row>\n\
					</rows>\n\
				</grid>\n\
				<keyset>\n\
					<key id="save" key="s" modifiers="control" oncommand="dialogCallback();" />\n\
				</keyset>\n\
				<script type="application/javascript"><![CDATA[\n\
				var [mi, bookmarks, _localize] = window.arguments;\n\
				window.onload = function() {\n\
					\// Don\'t use saved height\n\
					document.documentElement.removeAttribute("height");\n\
					window.sizeToContent();\n\
				};\n\
				function init() {\n\
					$("label").value = mi.getAttribute("label");\n\
					$("uri").value = mi.getAttribute("cb_uri");\n\
					$("icon").value = bookmarks.rawIcon(mi.getAttribute("image"));\n\
				}\n\
				function $(id) {\n\
					return document.getElementById(id);\n\
				}\n\
				function dialogCallback() {\n\
					var label = $("label").value;\n\
					var uri   = $("uri").value;\n\
					var icon  = $("icon").value;\n\
					var oldUri = mi.getAttribute("cb_uri");\n\
					if(\n\
						uri == oldUri\n\
						&& label == mi.getAttribute("label")\n\
						&& icon == bookmarks.rawIcon(mi.getAttribute("image"))\n\
					)\n\
						return true;\n\
					var oldAttrs = bookmarks.getAttributes(mi);\n\
					mi.setAttribute("label", label);\n\
					if(uri != oldUri) {\n\
						if(\n\
							mi.getAttribute("cb_ssData")\n\
							&& !Components.classes["@mozilla.org/embedcomp/prompt-service;1"]\n\
								.getService(Components.interfaces.nsIPromptService)\n\
								.confirm(\n\
									window,\n\
									_localize("Warning!"),\n\
									_localize("After location change all session data will be lost!")\n\
								)\n\
						)\n\
							return false;\n\
						mi.setAttribute("cb_uri", uri);\n\
						mi.setAttribute("tooltiptext", uri);\n\
						mi.setAttribute("cb_ssData", "");\n\
					}\n\
					mi.setAttribute("image", bookmarks.cachedIcon(icon));\n\
					var newAttrs = bookmarks.getAttributes(mi);\n\
					bookmarks.addUndo({ action: "attrs", mi: mi, oldAttrs: oldAttrs, newAttrs: newAttrs });\n\
					bookmarks.save();\n\
					return true;\n\
				}\n\
				init();\n\
				]]></script>\n\
			</dialog>';

		window.openDialog(
			"data:application/vnd.mozilla.xul+xml," + encodeURIComponent(dialog.replace(/^\s+/, "")),
			"_blank",
			"chrome,all,resizable,centerscreen,dependent",
			mi, this, _localize
		);
	},
	get propertiesWindows() {
		return this.wm.getEnumerator(this.button.id + ":propertiesDialog");
	},
	getPropertiesWindow: function(mi) {
		var ws = this.propertiesWindows;
		while(ws.hasMoreElements()) {
			let w = ws.getNext();
			if(w.mi == mi)
				return w;
		}
		return null;
	},
	closePropertiesWindow: function(mi) {
		var w = this.getPropertiesWindow(mi);
		w && w.close();
	},
	closePropertiesWindows: function() {
		var mis = Array.slice(this.mp.getElementsByAttribute("cb_uri", "*"));
		var ws = this.propertiesWindows;
		while(ws.hasMoreElements()) {
			let w = ws.getNext();
			if(mis.indexOf(w.mi) != -1)
				w.close();
		}
	},
	closeAllPropertiesWindows: function() {
		var ws = this.propertiesWindows;
		while(ws.hasMoreElements())
			ws.getNext().close();
	},
	onBookmarksChanged: function(hasBookmarks) {
		if(hasBookmarks === undefined)
			hasBookmarks = this.mp.getElementsByAttribute("cb_uri", "*").length > 0;
		this.button.disabled =
			this.$(this.sepId).hidden =
			this.$(this.openAllId).hidden =
			this.$(this.deleteAllId).disabled =
			this.$(this.sortId).disabled = !hasBookmarks;
		if(!hasBookmarks)
			this.mp.hidePopup();
		this.noBookmarks(!hasBookmarks);
	},
	noBookmarks: function(isEmpty) {
		var btn = this.button;
		var key = "_cbSessionBookmarks#" + this.btnNum + "_noBookmarks";
		var attr = "cb_sessionBookmarks_noBookmarks";
		// Note: we use global window[key] to save state, if button was edited
		// Also persist() may save empty attribute, so we can't use hasAttribute() check
		if(isEmpty === undefined)
			return key in window || btn.getAttribute(attr) == "true";
		_log("noBookmarks(" + isEmpty + ")");
		if(isEmpty) {
			window[key] = true;
			btn.setAttribute(attr, "true");
		}
		else {
			delete window[key];
			btn.removeAttribute(attr);
		}
		document.persist(btn.id, attr);
		return isEmpty;
	},
	initContextMenu: function(mi) {
		var isBtn = mi == this.button;
		var isEditable = mi.getAttribute("cb_bookmarkItem") == "true";
		var isBookmark = isEditable && mi.hasAttribute("cb_uri");
		this.$(this.deleteId).hidden = !isEditable;
		this.$(this.updateSepId).hidden = this.$(this.updateId).hidden = this.$(this.updateURIId).hidden = !isBookmark;
		this.$(this.addSepId).hidden = isBtn;
		this.$(this.undoId).disabled = !this.undo(true);
		this.$(this.redoId).disabled = !this.redo(true);
		this.$(this.propsSepId).hidden = this.$(this.propsId).hidden = !isBookmark;
		this.$(this.btnMenuSepId).hidden = this.$(this.btnMenuId).hidden = !isBtn;
		return true;
	},
	dragDataNS: "text/x-moz-custombuttons-sessionbookmarks-",
	_closeMenuTimeout: 0,
	_openMenuTimeout: 0,
	_openMenuDelay: 350,
	_closeMenuDelay: 350,
	_sourceNode: null,
	get _btnId() {
		delete this._btnId;
		return this._btnId = Math.random().toFixed(14).substr(2) + "-" + this.btnNum;
	},
	handleDragStart: function(e) {
		var mi = e.target;
		if(!mi.hasAttribute("cb_bookmarkItem"))
			return;
		var dragNS = this.dragDataNS;
		var dt = e.dataTransfer;
		dt.mozSetDataAt(dragNS + "buttonId", this._btnId, 0);
		if(mi.localName == "menuseparator") {
			//dt.mozSetDataAt("text/unicode",     "--------------------", 0);
			//dt.mozSetDataAt("text/html",        "<hr>",                 0);
			dt.mozSetDataAt(dragNS + "tagname", "menuseparator",        0);
		}
		else {
			let label  = mi.getAttribute("label");
			let uri    = mi.getAttribute("cb_uri");
			let icon   = mi.getAttribute("image");
			let ssData = mi.getAttribute("cb_ssData");

			let link = '<a href="' + this.encodeHTML(uri) + '">' + this.encodeHTML(label) + '</a>';
			dt.mozSetDataAt("text/unicode",        uri,                 0);
			dt.mozSetDataAt("text/html",           link,                0);
			dt.mozSetDataAt("text/x-moz-url",      uri + "\n" + label,  0);
			dt.mozSetDataAt("text/x-moz-url-data", uri,                 0);
			dt.mozSetDataAt("text/x-moz-url-desc", label,               0);

			dt.mozSetDataAt(dragNS + "tagname", "menuitem", 0);
			dt.mozSetDataAt(dragNS + "label",   label,      0);
			dt.mozSetDataAt(dragNS + "uri",     uri,        0);
			dt.mozSetDataAt(dragNS + "icon",    icon,       0);
			dt.mozSetDataAt(dragNS + "ssData",  ssData,     0);
		}
		dt.effectAllowed = "all";
		dt.addElement(mi);
		if(!("mozSourceNode" in dt))
			this._sourceNode = mi;
		e.stopPropagation();
	},
	handleDragOver: function(e) {
		var dt = e.dataTransfer;
		var types = dt.types;
		if(
			!types.contains("application/x-moz-tabbrowser-tab")
			&& !types.contains(this.dragDataNS + "tagname")
			&& ( // Firefox 8 (https://bugzilla.mozilla.org/show_bug.cgi?id=674732)
				!types.contains("text/x-moz-url")
				|| !("mozSourceNode" in dt)
				|| !this.getTabFromChild(dt.mozSourceNode)
			)
		)
			return null;
		clearTimeout(this._closeMenuTimeout);
		if(e.target == this.button && !this.button.open) {
			this._openMenuTimeout = setTimeout(function(btn) {
				btn.open = true;
			}, this._openMenuDelay, this.button);
		}
		var insPoint = this.getInsertionPoint(e);
		if(insPoint && insPoint.getAttributeNS("urn:custombuttons:namespace", "cb_dragOver") != "after") {
			this.markInsertionPoint(true);
			this.clearHighlight();
			if(insPoint.previousSibling)
				insPoint.previousSibling.setAttributeNS("urn:custombuttons:namespace", "cb_dragOver", "before");
			insPoint.setAttributeNS("urn:custombuttons:namespace", "cb_dragOver", "after");
		}
		e.preventDefault();
		e.stopPropagation();
		return dt.effectAllowed = dt.dropEffect = "link";
	},
	handleDragExit: function(e) {
		clearTimeout(this._openMenuTimeout);
		this._closeMenuTimeout = setTimeout(this.bind(function() {
			this.button.open = false;
			this._sourceNode = null;
			//this.markInsertionPoint(false);
			this.clearHighlight();
		}, this), this._closeMenuDelay);
	},
	handleDrop: function(e) {
		this.markInsertionPoint(false);
		this.clearHighlight();
		var dt = e.dataTransfer;
		var types = dt.types;
		//var uri = dt.mozGetDataAt("text/x-moz-text-internal", 0);
		var tab;
		if(types.contains("application/x-moz-tabbrowser-tab")) {
			let insPoint = this.getInsertionPoint(e);
			for(let i = dt.mozItemCount - 1; i >= 0; --i) {
				tab = dt.mozGetDataAt(TAB_DROP_TYPE, i);
				tab && this.addBookmark(insPoint, tab);
			}
			clearTimeout(this._closeMenuTimeout);
			return;
		}
		if(
			types.contains("text/x-moz-url")
			&& "mozSourceNode" in dt
			&& (tab = this.getTabFromChild(dt.mozSourceNode))
		) { // Firefox 8
			this.addBookmark(this.getInsertionPoint(e), tab);
			clearTimeout(this._closeMenuTimeout);
			return;
		}
		if(!types.contains(this.dragDataNS + "tagname"))
			return;
		clearTimeout(this._closeMenuTimeout);
		var mi = "mozSourceNode" in dt
			? dt.mozSourceNode
			: this._sourceNode;
		this._sourceNode = null;
		var insPoint = this.getInsertionPoint(e);
		if(!mi /* old Firefox w/o dt.mozSourceNode */ || mi.parentNode != this.mp) {
			let dragNS = this.dragDataNS;
			mi && mi.parentNode && mi.parentNode.parentNode.bookmarks.deleteBookmark(mi); //~ todo: use global _sourceNode ?
			if(dt.mozGetDataAt(dragNS + "tagname", 0) == "menuseparator") {
				this.addSeparator(insPoint);
				return;
			}
			let td = new this.tabData({
				label:  dt.mozGetDataAt(dragNS + "label",  0),
				uri:    dt.mozGetDataAt(dragNS + "uri",    0),
				icon:   dt.mozGetDataAt(dragNS + "icon",   0),
				ssData: dt.mozGetDataAt(dragNS + "ssData", 0)
			});
			this.addBookmark(insPoint, td);
			return;
		}
		if(insPoint == mi)
			return;
		this.addUndo({ action: "move", mi: mi, oldPos: mi.nextSibling, newPos: insPoint });
		this.mp.insertBefore(mi, insPoint);
		this.scheduleSave();
	},
	getInsertionPoint: function(e) {
		var trg = e.target;
		if(trg == this.button)
			return this.defaultInsPoint;
		if(trg == this.mp || trg.id == this.sepId || trg.id == this.openAllId)
			return this.$(this.sepId);
		var bo = trg.boxObject;
		if(e.screenY - bo.screenY < bo.height/2)
			return trg;
		return trg.nextSibling;
	},
	getTabFromChild: function(node) {
		for(; node && "className" in node; node = node.parentNode)
			if(/(?:^|\s)tabbrowser-tab(?:\s|$)/.test(node.className))
				return node;
		return null;
	},
	clearHighlight: function() {
		Array.slice(
			this.mp.getElementsByAttributeNS("urn:custombuttons:namespace", "cb_dragOver", "*")
		).forEach(function(node) {
			node.removeAttributeNS("urn:custombuttons:namespace", "cb_dragOver");
		});
	},
	_hasDNDStyles: false,
	markInsertionPoint: function(add) {
		if(this._hasDNDStyles ^ !add)
			return;
		this._hasDNDStyles = add;
		var cssStr = '\
			/* Only for Firefox 4.0+ */\n\
			@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
			@namespace cb url("urn:custombuttons:namespace");\n\
			@-moz-document url("%windowURL%") {\n\
				[cb_bookmarkItem][cb|cb_dragOver="before"] > label {\n\
					border-bottom: 2px solid graytext !important;\n\
					margin-bottom: -2px !important;\n\
				}\n\
				[cb_bookmarkItem][cb|cb_dragOver="after"] > label {\n\
					border-top: 2px solid graytext !important;\n\
					margin-top: -2px !important;\n\
				}\n\
				menuitem[cb_bookmarkItem][cb|cb_dragOver="before"] + [cb_bookmarkItem][cb|cb_dragOver="after"] > label {\n\
					border-top-color: transparent !important;\n\
				}\n\
			}'
			.replace(/%windowURL%/g, window.location.href);
		var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
			.getService(Components.interfaces.nsIStyleSheetService);
		var cssURI = this.ios.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
		var has = sss.sheetRegistered(cssURI, sss.USER_SHEET);
		if(add && !has)
			sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);
		else if(!add && has)
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
	},
	handleBookmarkDrop: function(e) {
		var dt = e.dataTransfer;
		var dragNS = this.dragDataNS;
		if(
			!dt.types.contains(dragNS + "uri")
			|| dt.mozGetDataAt(dragNS + "buttonId", 0) != this._btnId
		)
			return;

		var tab, tabs;
		if(e.view.top == window) {
			let trg = e.originalTarget;
			for(; trg; trg = trg.parentNode) {
				if(/(?:^|\s)tabbrowser-tabs?(?:\s|$)/.test(trg.className)) {
					if(trg.localName == "tabs")
						tabs = trg;
					else {
						tab = trg;
						tabs = trg.parentNode;
					}
					break;
				}
			}
		}
		else if(e.view.top == content) {
			let trg = e.target;
			//if(trg instanceof HTMLTextAreaElement || trg.contentEditable == "true")
			//	return;
			//if(trg instanceof HTMLInputElement) try {
			//	if(typeof trg.selectionStart == "number")
			//		return;
			//}
			//catch(e) {
			//}
			let cs = trg.ownerDocument.defaultView.getComputedStyle(trg, null);
			let userModify = "userModify" in cs ? cs.userModify : cs.MozUserModify;
			if(userModify == "read-write")
				return;
			tab = gBrowser.selectedTab;
			tabs = gBrowser.tabContainer;
		}

		if(!tabs)
			return;

		var ssData = dt.mozGetDataAt(dragNS + "ssData", 0);
		var uri    = dt.mozGetDataAt(dragNS + "uri",    0);

		var _this = this;
		function tabOpen(e) {
			e.currentTarget.removeEventListener(e.type, tabOpen, true);
			clearTimeout(timer);
			var tab = e.target;
			_this.setTabSession(tab, ssData, uri);
			_log(e.type + " => setTabSession()");
		}
		tabs.addEventListener("TabOpen", tabOpen, true);
		var timer = setTimeout(function() {
			tabs.removeEventListener("TabOpen", tabOpen, true);
			if(tab) {
				_this.setTabSession(tab, ssData, uri, true);
				_log("setTimeout => to TabOpen => setTabSession() for current tab");
			}
		}, 0);
	},
	sortBookmarks: function(sortOrder, reverse) {
		// sortOrder: array of strings, possible values:
		// "name", "uri", "host", "baseDomain" (see sortBookmarksNodes())
		// Example: sortBookmarks(["baseDomain", "host", "name"])
		// We sort separately each "section" between menuseparator's
		// (just like built-in Sort By Name for bookmarks)
		var sections = [[]];
		var section = sections[0];
		var chs = this.mp.childNodes;
		for(var i = 0, l = chs.length; i < l; ++i) {
			let ch = chs[i];
			if(ch.hasAttribute("cb_uri"))
				section.push(ch);
			else if(ch.localName == "menuseparator") {
				if(ch.id == this.sepId)
					break;
				sections.push(section = []);
			}
		}
		var undo = [];
		sections.forEach(function(section) {
			this.sortBookmarksNodes(section, sortOrder, reverse, undo);
		}, this);
		this.addUndo({ action: "moves", actions: undo.reverse() });
		this.cm.hidePopup();
		this.scheduleSave();
	},
	sortBookmarksNodes: function(bookmarksNodes, sortOrder, reverse, undo) {
		if(!bookmarksNodes.length)
			return;

		var insPoint = bookmarksNodes[bookmarksNodes.length - 1].nextSibling;
		var sort = {
			name: false,
			uri: false,
			host: false,
			baseDomain: false,
			__proto__: null
		};
		sortOrder.forEach(function(s) {
			sort[s] = true;
		});

		var df = document.createDocumentFragment();
		var greaterThan = reverse ? -1 : 1;
		var bookmarks = bookmarksNodes
			.map(function(mi) {
				var bm = {};
				if(sort.uri || sort.host || sort.baseDomain)
					bm.uri = mi.getAttribute("cb_uri");
				if(sort.name)
					bm.name = mi.getAttribute("label");
				if(sort.host || sort.baseDomain) try {
					let u = this.ios.newURI(bm.uri, null, null);
					if(sort.host)
						bm.host = u.host;
					if(sort.baseDomain)
						bm.baseDomain = this.tld.getBaseDomain(u);
				}
				catch(e) {
					//Components.utils.reportError(e);
				}
				return {
					mi: mi,
					key: sortOrder.map(function(s) {
						return bm[s];
					}).join("\n")
				};
			}, this)
			.sort(function(bm1, bm2) {
				var s1 = bm1.key;
				var s2 = bm2.key;
				return s1 == s2 ? 0 : s1 > s2 ? greaterThan : -greaterThan;
			})
			.forEach(function(bm) {
				var mi = bm.mi;
				undo && undo.push({ action: "move", mi: mi, oldPos: mi.nextSibling, newPos: insPoint });
				//this.mp.insertBefore(mi, insPoint);
				df.appendChild(mi);
			}, this);
		this.mp.insertBefore(df, insPoint);
	},
	showLink: function(e) {
		if(!("XULBrowserWindow" in window))
			return;
		if(e.type == "DOMMenuItemActive")
			XULBrowserWindow.setOverLink(e.target.getAttribute("tooltiptext") || "", null);
		else if(e.type == "DOMMenuItemInactive")
			XULBrowserWindow.setOverLink("", null);
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
	hasModifier: function(e) {
		return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	},
	escapeString: function(s) {
		return s.replace(/\n/g, "\r");
	},

	PERMS_FILE_READ:        parseInt("0444", 8),
	PERMS_FILE_WRITE:       parseInt("0644", 8),
	PERMS_FILE_OWNER_WRITE: parseInt("0600", 8),
	writeToFileAsync: function(str, file, callback, context) {
		try {
			Components.utils.import("resource://gre/modules/NetUtil.jsm");
			Components.utils.import("resource://gre/modules/FileUtils.jsm");
		}
		catch(e) {
			this.writeToFileAsync = function(str, file, callback, context) {
				var status = Components.results.NS_ERROR_FILE_ACCESS_DENIED;
				try {
					this.writeToFile(str, file);
					status = Components.results.NS_OK;
				}
				catch(e) {
					Components.utils.reportError(e);
				}
				callback && callback.call(context || this, status, str);
			};
			this.writeToFileAsync.apply(this, arguments);
			return;
		}
		var ostream = FileUtils.openSafeFileOutputStream(file);
		var suc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
			.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		suc.charset = "UTF-8";
		var istream = suc.convertToInputStream(str);
		NetUtil.asyncCopy(istream, ostream, callback && this.bind(function(status) {
			callback.call(context || this, status, str);
		}, this));
	},
	writeToFile: function(str, file) {
		var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);
		fos.init(file, 0x02 | 0x08 | 0x20, this.PERMS_FILE_WRITE, 0);
		var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
			.createInstance(Components.interfaces.nsIConverterOutputStream);
		cos.init(fos, "UTF-8", 0, 0);
		cos.writeString(str);
		cos.close(); // this closes fos
	},
	readFromFileAsync: function(file, callback, context) {
		try {
			Components.utils.import("resource://gre/modules/NetUtil.jsm");
			if(!("newChannel" in NetUtil))
				throw "Firefox 3.6";
		}
		catch(e) {
			this.readFromFileAsync = function(file, callback, context) {
				var status = Components.results.NS_ERROR_FILE_ACCESS_DENIED;
				try {
					var data = this.readFromFile(file);
					status = Components.results.NS_OK;
				}
				catch(e) {
					Components.utils.reportError(e);
				}
				callback.call(context || this, data, 0);
			};
			this.readFromFileAsync.apply(this, arguments);
			return;
		}
		NetUtil.asyncFetch(file, this.bind(function(istream, status) {
			var data = "";
			if(Components.isSuccessCode(status)) {
				try { // Firefox 7.0a1 throws after istream.available() on empty files
					data = NetUtil.readInputStreamToString(
						istream,
						istream.available(),
						{ charset: "UTF-8", replacement: "\ufffd" } // Only Gecko 11.0+
					);
					if(NetUtil.readInputStreamToString.length < 3)
						data = this.convertToUnicode(data);
				}
				catch(e) {
				}
			}
			callback.call(context || this, data, status);
		}, this));
	},
	readFromFile: function(file) {
		var fis = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);
		fis.init(file, 0x01, this.PERMS_FILE_READ, 0);
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
			.createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(fis);
		var str = sis.read(fis.available());
		sis.close();
		fis.close();
		return this.convertToUnicode(str);
	},
	convertToUnicode: function(str) {
		var suc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
			.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		suc.charset = "utf8";
		try {
			return suc.ConvertToUnicode(str);
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		return str;
	},
	copyFileAsync: function(file, newFile, callback, context) {
		try {
			Components.utils.import("resource://gre/modules/NetUtil.jsm");
		}
		catch(e) {
			this.copyFileAsync = function(file, newFile, callback, context) {
				var status = Components.results.NS_ERROR_FILE_COPY_OR_MOVE_FAILED;
				try {
					if(newFile.exists())
						newFile.remove(true);
					file.copyTo(newFile.parent, newFile.leafName);
					status = Components.results.NS_OK;
				}
				catch(e) {
					Components.utils.reportError(e);
				}
				callback.call(context || this, status);
			};
			this.copyFileAsync.apply(this, arguments);
			return;
		}
		try {
			var fis = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
			fis.init(file, 0x01, this.PERMS_FILE_READ, 0);
			var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
				.createInstance(Components.interfaces.nsIFileOutputStream);
			fos.init(newFile, 0x02 | 0x08 | 0x20, this.PERMS_FILE_WRITE, 0);

			NetUtil.asyncCopy(fis, fos, this.bind(function(status) {
				callback.call(context || this, status);
			}, this));
		}
		catch(e) {
			Components.utils.reportError(e);
			callback.call(context || this, Components.results.NS_ERROR_FILE_ACCESS_DENIED);
		}
	},
	ensureFilePermissions: function(file, mask) {
		try {
			if(file.exists() && !(file.permissions & mask))
				file.permissions |= mask;
		}
		catch(e) {
			Components.utils.reportError(e);
		}
	},
	bind: function(func, context, args) {
		return function() {
			return func.apply(context, args || arguments);
		};
	},
	createElement: function(name, attrs) {
		var node = document.createElement(name);
		if(attrs) for(var attrName in attrs) if(attrs.hasOwnProperty(attrName))
			node.setAttribute(attrName, attrs[attrName]);
		return node;
	},
	parseXULFromString: function(xul) {
		xul = xul.replace(/>\s+</g, "><");
		return new DOMParser().parseFromString(xul, "application/xml").documentElement;
	},
	encodeHTML: function(s) {
		return s.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}
};
_log("init");
this.bookmarks.initProxy();
this.onDestroy = function(reason) {
	if(reason == "constructor")
		return; // Changed XBL binding, ignore
	_log("destroy: " + reason);
	this.bookmarks.destroy(reason == "update" || reason == "delete");
	if(reason == "delete")
		this.bookmarks.noBookmarks(false);
};
this.type = "menu";
this.orient = "horizontal";
if(options.hideDropMarker || options.showLabel != undefined) {
	let btn = this;
	let doc = btn.ownerDocument;
	let stopTime = Date.now() + 500;
	setTimeout(function tweakButton() { // Wait for menu XBL binding
		var dm = options.hideDropMarker
			&& doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-menu-dropmarker");
		var lb = options.showLabel != undefined
			&& doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-text");
		if(dm) {
			dm.hidden = true;
			// Hack for Firefox 19 and large icons
			let icon = doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
			if(icon) {
				let s = doc.defaultView.getComputedStyle(icon, null);
				if(s.paddingRight != s.paddingLeft)
					icon.style.paddingLeft = icon.style.paddingRight = s.paddingLeft;
			}
		}
		if(lb)
			lb.style.display = options.showLabel ? "-moz-box" : "none";
		if(!dm && !lb && Date.now() < stopTime)
			setTimeout(tweakButton, 10);
	}, 0);
}

function _info(s) {
	var id = self.id.match(/\d*$/)[0];
	var cs = Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService);
	function ts() {
		var d = new Date();
		var ms = d.getMilliseconds();
		return d.toLocaleFormat("%M:%S:") + "000".substr(String(ms).length) + ms;
	}
	_info = function(s) {
		cs.logStringMessage("[Session Bookmarks #" + id + "]: " + ts() + " " + s);
	};
	return _info.apply(this, arguments);
}
function _log(s) {
	_debug && _info(s);
}