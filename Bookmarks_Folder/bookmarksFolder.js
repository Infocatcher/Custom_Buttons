// http://infocatcher.ucoz.net/js/cb/bookmarksFolder.js
// https://forum.mozilla-russia.org/viewtopic.php?id=57872
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Bookmarks_Folder

// Bookmarks Folder button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011-2016
// version 0.1.2 - 2016-01-04

// Compatibility: Firefox 4.0+, SeaMonkey 2.1+

// Icon by FatCow Web Hosting: http://www.iconfinder.com/icondetails/36059/16/

// Hidden feature: you can manually set extensions.custombuttons.button<N>.bookmarkFolder
// preference to any place: URI https://developer.mozilla.org/en-US/docs/Places_query_URIs
// (and press OK in button editor or reopen window or restart browser)

var options = {
	hideDropMarker: true, // Hide "v" after button's icon
	showLabel: undefined, // Set to true/false to force show/hide button's label
	useFolderTitle: true,
	// "Select folder" dialog:
	dialogWidth: 400,
	dialogHeight: 350,
	dialogPersist: "" // Example: "screenX screenY width height"
};

function _localize(s, key) {
	var strings = {
		"Select folder": {
			ru: "Выберите папку"
		},
		"Root folder": {
			ru: "Корневая папка"
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
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s) {
			return strings[s] && strings[s][locale] || s;
		};
	return _localize.apply(this, arguments);
}

function hasModifier(e) {
	return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
}
this.onclick = function(e) {
	if(e.target != this)
		return;
	if(e.button != 2 && !this.bookmarks.initialized)
		this.bookmarks.init();
	else if(e.button == 1 || e.button == 0 && hasModifier(e))
		this.bookmarks.changeFolder();
};
this.onmousedown = function(e) {
	if(e.target == this && e.button == 0 && hasModifier(e))
		e.preventDefault();
};
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
this.bookmarks = {
	button: this,
	get pref() {
		delete this.pref;
		return this.pref = "extensions.custombuttons.button" + this.button.id.match(/\d*$/)[0] + ".bookmarkFolder";
	},
	get folder() {
		return this.getStringPref(this.pref, "");
	},
	set folder(val) {
		this.setStringPref(this.pref, "" + val);
	},
	get titlePref() {
		delete this.titlePref;
		return this.titlePref = "extensions.custombuttons.button" + this.button.id.match(/\d*$/)[0] + ".bookmarkFolderTitle";
	},
	get folderTitle() {
		return this.getStringPref(this.titlePref, "");
	},
	set folderTitle(val) {
		this.setStringPref(this.titlePref, val);
	},
	initialized: false,
	init: function() {
		var folder = this.folder;
		if(!folder) {
			folder = this.selectFolder();
			if(!folder)
				return;
			this.folder = folder;
		}
		var btn = this.button;
		btn.setAttribute("ondragenter", "PlacesMenuDNDHandler.onDragEnter(event);");
		btn.setAttribute("ondragover",  "PlacesMenuDNDHandler.onDragOver(event);");
		btn.setAttribute("ondragexit",  "PlacesMenuDNDHandler.onDragExit(event);");
		//btn.setAttribute("ondrop",      "PlacesMenuDNDHandler.onDrop(event);");
		btn.setAttribute("ondrop",      "this.bookmarks.onDrop(event);");
		var mp = btn.getElementsByTagName("menupopup");
		mp.length && mp[0].parentNode.removeChild(mp[0]);
		mp = this.mp = document.createElementNS(xulns, "menupopup");
		mp.setAttribute("context", "placesContext");
		mp.setAttribute("placespopup", "true");
		var placeURI = this.toPlaceURI(folder);
		placeURI = placeURI.replace(/"/g, '\\"');
		mp.setAttribute(
			"onpopupshowing",
			'this.parentNode.bookmarks.initMenu(event, "' + placeURI + '");'
		);
		mp.setAttribute("oncommand", "BookmarksEventHandler.onCommand(event, this.parentNode._placesView);");
		mp.setAttribute("onclick", "BookmarksEventHandler.onClick(event, this.parentNode._placesView);");
		mp.setAttribute("tooltip", "bhTooltip");
		mp.setAttribute("popupsinherittooltip", "true");
		var tb = btn.parentNode;
		if(tb.getAttribute("orient") == "vertical") {
			// https://addons.mozilla.org/firefox/addon/vertical-toolbar/
			var isRight = tb.parentNode.getAttribute("placement") == "right";
			mp.setAttribute("position", isRight ? "start_before" : "end_before");
		}
		btn.appendChild(mp);
		options.useFolderTitle && setTimeout(function(_this) {
			_this.setButtonTitle();
		}, 0, this);

		this.initialized = true;
	},
	toPlaceURI: function(folder) {
		if(("" + folder).substr(0, 6) == "place:")
			return folder;
		return "place:folder=" + folder + "&excludeItems=0&expandQueries=0";
	},
	initMenu: function(event, placeURI) {
		var btn = this.button;
		if("_placesView" in btn)
			return;
		btn._placesMenu = new PlacesMenu(event, placeURI);
		if(options.useFolderTitle)
			this.setButtonTitle(btn._placesView._resultNode && btn._placesView._resultNode.title);
		// Add "Open All in Tabs" menuitem
		try {
			btn._placesView._mayAddCommandsItems.call({
				_rootElt: null,
				__proto__: btn._placesView
			}, btn.firstChild);
		}
		catch(e) {
			PlacesViewBase.prototype._mayAddCommandsItems(btn.firstChild);
		}
	},
	destroy: function() {
		this.stopClicker && this.stopClicker();
		var btn = this.button;
		if(!("_placesMenu" in btn))
			return;
		try {
			btn._placesMenu.uninit();
		}
		catch(e) {
			Components.utils.reportError(e);
		}
		delete btn._placesView;
		delete btn._placesMenu;
	},
	setButtonTitle: function(title) {
		var btn = this.button;
		if(title)
			this.folderTitle = title;
		else
			title = this.folderTitle;
		if(title)
			btn.tooltipText = btn.label = title;
	},
	initWithFolder: function(folder) {
		this.destroy();
		this.folder = folder;
		var mp = this.mp;
		mp.setAttribute(
			"onpopupshowing",
			mp.getAttribute("onpopupshowing")
				.replace(/place:[^'"]+/, this.toPlaceURI(folder).replace(/"/g, '\\"'))
		);
	},
	selectFolder: function() {
		if(parseFloat(Services.appinfo.platformVersion) >= 59)
			return this.selectFolderNoUI();

		var winType = this.button.id + ":dialog";
		var win = Services.wm.getMostRecentWindow(winType);
		if(win) {
			win.focus();
			return null;
		}
		// https://developer.mozilla.org/en/Displaying_Places_information_using_views
		var rootFolder = PlacesUIUtils.allBookmarksFolderId;
		var placesOverlay = Services.appinfo.name == "SeaMonkey"
			? '\n\
			<?xml-stylesheet href="chrome://communicator/skin/bookmarks/bookmarks.css"?>\n\
			<?xml-stylesheet href="chrome://communicator/content/places/places.css"?>\n\
			<?xul-overlay href="chrome://communicator/content/bookmarks/placesOverlay.xul"?>'
			: '\n\
			<?xml-stylesheet href="chrome://browser/content/places/places.css"?>\n\
			<?xml-stylesheet href="chrome://browser/skin/places/places.css"?>\n\
			<?xul-overlay href="chrome://browser/content/places/placesOverlay.xul"?>';
		// Note: <property name="view"> from chrome://communicator/content/places/tree.xml#places-tree
		// are null sometimes.
		// We are trying to re-apply binding as a workaround.
		var persist = options.dialogPersist;
		if(persist) {
			persist = '\n\
				persist="' + persist + '"';
		}
		var winSrc = '\
			<?xml version="1.0"?>\n\
			<?xml-stylesheet href="chrome://global/skin/" type="text/css"?>'
			+ placesOverlay + '\n\
			<dialog xmlns="' + xulns + '"\n\
				id="' + this.button.id + "-dialog" + '"\n\
				windowtype="' + winType + '"\n\
				title="' + _localize("Select folder") + '"\n\
				buttons="accept,cancel"\n\
				onload="init();"\n\
				ondialogaccept="return dialogCallback();"\n\
				width="' + options.dialogWidth + '"\n\
				height="' + options.dialogHeight + '"' + persist + '>\n\
				<keyset>\n\
					<key id="key-accept" keycode="VK_RETURN" modifiers="control"\n\
						oncommand="document.documentElement.acceptDialog();" />\n\
				</keyset>\n\
				<tree id="tree" type="places"\n\
					place="place:excludeItems=1&amp;excludeQueries=1&amp;folder=' + rootFolder + '"\n\
					hidecolumnpicker="true" seltype="single" flex="1"\n\
					onselect="onSelect();">\n\
					<treecols>\n\
						<treecol id="title" flex="1" primary="true" hideheader="true" />\n\
					</treecols>\n\
					<treechildren />\n\
				</tree>\n\
				<checkbox id="root" label="' + _localize("Root folder") + '" oncommand="onSelect();" />\n\
				<script type="application/javascript"><![CDATA[\n\
				var [folderId, rootFolder, callback, context] = window.arguments;\n\
				var tree = document.getElementById("tree");\n\
				var root = document.getElementById("root");\n\
				function init() {\n\
					if(!ensurePlacesBinding(init, this, arguments))\n\
						return;\n\
					if(folderId == rootFolder)\n\
						root.checked = true;\n\
					else if(folderId != undefined) {\n\
						tree.selectItems([folderId]);\n\
						var i = tree.view.selection.currentIndex;\n\
						if(i != -1) {\n\
							setTimeout(function() {\n\
								tree.treeBoxObject.ensureRowIsVisible(i);\n\
							}, 0);\n\
						}\n\
					}\n\
					onSelect();\n\
				}\n\
				function onSelect(dis) {\n\
					if(!ensurePlacesBinding(onSelect, this, arguments))\n\
						return;\n\
					if(!arguments.length)\n\
						dis = !root.checked && !tree.view.selection.getRangeCount();\n\
					document.documentElement.getButton("accept").disabled = dis;\n\
					disableTree(root.checked);\n\
				}\n\
				function ensurePlacesBinding(func, context, args) {\n\
					if(tree.view && tree.selectItems)\n\
						return true;\n\
					\// Try re-apply binding, hack for SeaMonkey\n\
					tree.removeAttribute("type");\n\
					setTimeout(function() {\n\
						tree.setAttribute("type", "places");\n\
						setTimeout(function() {\n\
							func.apply(context, args);\n\
						}, 0);\n\
					}, 0);\n\
					return false;\n\
				}\n\
				function disableTree(dis) {\n\
					var treechildren = tree.getElementsByTagName("treechildren")[0];\n\
					if(dis) {\n\
						treechildren.style.opacity = "0.6";\n\
						tree.setAttribute("disabled", "true");\n\
					}\n\
					else {\n\
						treechildren.style.opacity = "";\n\
						tree.removeAttribute("disabled");\n\
					}\n\
				}\n\
				function dialogCallback() {\n\
					if(root.checked)\n\
						var id = rootFolder;\n\
					else {\n\
						var view = tree.view;\n\
						var i = view.selection.currentIndex;\n\
						if(i == -1)\n\
							return false;\n\
						var item = view.nodeForTreeIndex(i);\n\
						if(item) {\n\
							var id = /place:folder=(\\w+)/.test(item.uri)\n\
								? RegExp.$1\n\
								: item.itemId;\n\
						}\n\
					}\n\
					callback.call(context, id);\n\
					return true;\n\
				}\n\
				onSelect(false);\n\
				]]></script>\n\
			</dialog>';
		var folder;
		var callback = function(folderId) {
			folder = folderId;
		};
		var folderId = this.getFolderId(this.folder);
		if("Services" in window && Services.prefs.getBoolPref.length > 1) { // Firefox 57+
			let pref = "security.data_uri.unique_opaque_origin";
			if(Services.prefs.getBoolPref(pref, false)) {
				Services.prefs.setBoolPref(pref, false);
				setTimeout(function() {
					Services.prefs.setBoolPref(pref, true);
				}, 0);
			}
		}
		window.openDialog(
			"data:application/vnd.mozilla.xul+xml," + encodeURIComponent(winSrc.replace(/^\s+/, "")),
			"_blank",
			"chrome,all,resizable,centerscreen,modal",
			folderId, rootFolder, callback, this
		);
		if(folder && options.useFolderTitle) setTimeout(function(btn) {
			var mp = btn.firstChild;
			mp.collapsed = true;
			btn.open = true;
			btn.open = false;
			mp.collapsed = false;
		}, 100, this.button);
		return folder;
	},
	selectFolderNoUI: function() {
		var folder, clicker;

		var _this = this;
		var btn = this.button;
		btn.style.outline = "3px solid orange";
		btn.style.outlineOffset = "-3px";
		var cbAttr = "cb_bookmarksFolder";
		var menubar = document.getElementById("toolbar-menubar");
		if(menubar && menubar.getAttribute("autohide") == "true")
			menubar.setAttribute("autohide", cbAttr);
		var wAttr = cbAttr + "-" + Date.now();
		var de = document.documentElement;
		de.setAttribute(wAttr, "true");
		var stopClicker = this.stopClicker = function() {
			_this.stopClicker = null;
			btn.style.outline = btn.style.outlineOffset = "";
			window.removeEventListener("click", clicker, true);
			if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
				sss.unregisterSheet(cssURI, sss.USER_SHEET);
			if(menubar && menubar.getAttribute("autohide") == cbAttr)
				menubar.setAttribute("autohide", "true");
			de.removeAttribute(wAttr);
		};
		function cancelClicker() {
			var id = PlacesUtils.bookmarks && PlacesUtils.bookmarks.rootGuid || "root________";
			folder = "place:parent=" + id;
			stopClicker();
		}
		function isFolder(it) {
			if(it.id == "bookmarksMenu")
				return true;
			return it.classList
				&& it.classList.contains("bookmark-item")
				&& it.getAttribute("container") == "true";
		}
		function closeMenus(node) {
			for(; node; node = node.parentNode)
				"hidePopup" in node && node.hidePopup();
		}
		window.addEventListener("click", clicker = function(e) {
			var trg = e.originalTarget || e.target;
			if(trg == btn) {
				e.stopPropagation();
				cancelClicker();
				return;
			}
			if(!isFolder(trg))
				return;
			if(!(e.button == 1 || e.button == 0 && hasModifier(e)))
				return;
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation && e.stopImmediatePropagation();
			folder = trg._placesNode && trg._placesNode.uri
				|| trg._placesView && trg._placesView._place;
			stopClicker();
			closeMenus(trg);
			// initMenu() -> ._placesView._resultNode.title returns "" sometimes
			_this.setButtonTitle(trg.getAttribute("label"));
		}, true);

		var cssStr = '\
			:root[%wAttr%] #bookmarksMenu,\n\
			:root[%wAttr%] .bookmark-item[container="true"] {\n\
				color: red !important;\n\
			}\n\
			:root[%wAttr%] #bookmarksMenu:hover,\n\
			:root[%wAttr%] .bookmark-item[container="true"]:hover {\n\
				outline: 2px solid orange !important;\n\
				outline-offset: -2px !important;\n\
			}'
			.replace(/%wAttr%/g, wAttr);
		var cssURI = Services.io.newURI("data:text/css," + encodeURIComponent(cssStr), null, null);
		var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
			.getService(Components.interfaces.nsIStyleSheetService);
		if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);

		setTimeout(cancelClicker, 60e3);

		var thread = Services.tm.currentThread;
		while(folder === undefined) // Force sync magic
			thread.processNextEvent(true);
		return folder;
	},
	changeFolder: function() {
		if(!this.initialized) {
			this.init();
			return;
		}
		var folder = this.selectFolder();
		if(!folder)
			return;
		this.initWithFolder(folder);

		var ws = Services.wm.getEnumerator("navigator:browser");
		while(ws.hasMoreElements()) {
			let w = ws.getNext();
			if(w == window)
				continue;
			let btn = w.document.getElementById(this.button.id);
			if(btn) {
				btn.bookmarks.initWithFolder(folder);
				setTimeout(function(btn, _this) {
					btn.tooltipText = _this.button.tooltipText;
				}, 110, btn, this); // Will be updatetd after 100ms in selectFolder()
			}
		}
	},
	getFolderId: function(folder) {
		if(/^\d+$/.test(folder))
			return Number(folder);
		var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
			.getService(Components.interfaces.nsINavBookmarksService);
		switch(folder) {
			case "BOOKMARKS_MENU":    return bmsvc.bookmarksMenuFolder;
			case "TOOLBAR":           return bmsvc.toolbarFolder;
			case "UNFILED_BOOKMARKS": return bmsvc.unfiledBookmarksFolder;
		}
		return undefined;
	},
	placesDrop: function(event, folder) {
		// Based on PlacesMenuDNDHandler.onDrop(event) function
		try {
		    var ip = new InsertionPoint(folder, PlacesUtils.bookmarks.DEFAULT_INDEX, Ci.nsITreeView.DROP_ON);
		    PlacesControllerDragHelper.onDrop(ip, event.dataTransfer);
		    event.stopPropagation();
	    }
	    catch(e) {
	    	Components.utils.reportError(e);
	    }
	},
	onDrop: function(e) {
		var folder = this.folder;
		if(e.target != this.button || !folder) {
			PlacesMenuDNDHandler.onDrop(e);
			return;
		}
		var folderId = this.getFolderId(folder);
		if(folderId)
			this.placesDrop(e, folderId);
		else
			PlacesMenuDNDHandler.onDrop(e);
	},
	getStringPref: function(name, defaultVal) {
		if("getStringPref" in Services.prefs) // Firefox 58+
			return Services.prefs.getStringPref(name, defaultVal);
		try {
			return Services.prefs.getComplexValue(name, Components.interfaces.nsISupportsString).data;
		}
		catch(e) {
		}
		return defaultVal;
	},
	setStringPref: function(name, val) {
		if("setStringPref" in Services.prefs) { // Firefox 58+
			Services.prefs.setStringPref(name, val);
			return;
		}
		var ss = Components.interfaces.nsISupportsString;
		var str = Components.classes["@mozilla.org/supports-string;1"]
			.createInstance(ss);
		str.data = val;
		Services.prefs.setComplexValue(name, ss, str);
	}
};

this.type = "menu";
this.orient = "horizontal";
if(options.hideDropMarker || options.showLabel != undefined) {
	let btn = this;
	let doc = btn.ownerDocument;
	let stopTime = Date.now() + 500;
	setTimeout(function tweakButton() { // Wait for menu XBL binding
		var dm = options.hideDropMarker && (
			btn.dropmarker
			|| doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-menu-dropmarker")
		);
		var lb = options.showLabel != undefined && (
			btn.multilineLabel
			|| doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-text")
		);
		if(dm) {
			dm.hidden = true;
			// Hack for Firefox 19 and large icons
			let icon = btn.icon
				|| doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
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

setTimeout(function(_this) { // Don't show modal "Select folder" dialog during initialization
	_this.bookmarks.init();
}, 0, this);
this.onDestroy = function() {
	this.bookmarks.destroy();
};