// http://infocatcher.ucoz.net/js/cb/bookmarksFolder.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Bookmarks_Folder

// Bookmarks Folder button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011-2012
// version 0.1.0pre12 - 2012-11-01

// Compatibility: Firefox 4.0+, SeaMonkey 2.1+

// Icon by FatCow Web Hosting: http://www.iconfinder.com/icondetails/36059/16/

// Hidden feature: you can manually set extensions.custombuttons.button<N>.bookmarkFolder
// preference to any place: URI https://developer.mozilla.org/en-US/docs/Places_query_URIs
// (and press OK in button editor or reopen window or restart browser)

var hideDropMarker = true;

function _localize(s, key) {
	var strings = {
		"Select folder": {
			ru: "Выберите папку"
		},
		"Root folder": {
			ru: "Корневая папка"
		}
	};
	var locale = (cbu.getPrefs("general.useragent.locale") || "en").match(/^[a-z]*/)[0];
	_localize = !locale || locale == "en"
		? function(s) {
			return s;
		}
		: function(s) {
			return strings[s] && strings[s][locale] || s;
		};
	return _localize.apply(this, arguments);
}

this.onclick = function(e) {
	if(e.target != this)
		return;
	if(e.button != 2 && !this.bookmarks.initialized)
		this.bookmarks.init();
	else if(e.button == 1 || e.button == 0 && (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey))
		this.bookmarks.changeFolder();
};
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
this.bookmarks = {
	button: this,
	get pref() {
		delete this.pref;
		return this.pref = "extensions.custombuttons.button" + this.button.id.match(/\d*$/)[0] + ".bookmarkFolder";
	},
	get folder() {
		return cbu.getPrefs(this.pref) || "";
	},
	set folder(val) {
		cbu.setPrefs(this.pref, String(val));
	},
	get wm() {
		delete this.wm;
		return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			.getService(Components.interfaces.nsIWindowMediator);
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
		mp = document.createElement("menupopup");
		mp.setAttribute("context", "placesContext");
		mp.setAttribute("placespopup", "true");
		var placeURI = folder.substr(0, 6) == "place:"
			? folder
			: "place:folder=" + folder + "&amp;excludeItems=0&amp;expandQueries=0";
		mp.setAttribute(
			"onpopupshowing",
			'if(!this.parentNode._placesView)\
				this.parentNode._placesMenu = new PlacesMenu(event, "' + placeURI + '");'
		);
		mp.setAttribute("oncommand", "BookmarksEventHandler.onCommand(event, this.parentNode._placesView);");
		mp.setAttribute("onclick", "BookmarksEventHandler.onClick(event, this.parentNode._placesView);");
		mp.setAttribute("tooltip", "bhTooltip");
		mp.setAttribute("popupsinherittooltip", "true");
		btn.appendChild(mp);

		this.initialized = true;
	},
	destroy: function() {
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
	initWithFolder: function(folder) {
		this.destroy();
		this.folder = folder;
		var mp = this.button.firstChild;
		mp.setAttribute(
			"onpopupshowing",
			mp.getAttribute("onpopupshowing")
				.replace(/(place:folder=)\w+/, "$1" + folder)
		);
	},
	selectFolder: function() {
		var winType = this.button.id + ":dialog";
		var win = this.wm.getMostRecentWindow(winType);
		if(win) {
			win.focus();
			return null;
		}
		// https://developer.mozilla.org/en/Displaying_Places_information_using_views
		var rootFolder = PlacesUIUtils.allBookmarksFolderId;
		var placesOverlay = Application.name == "SeaMonkey"
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
				width="400"\n\
				height="350">\n\
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
		window.openDialog(
			"data:application/vnd.mozilla.xul+xml," + encodeURIComponent(winSrc.replace(/^\s+/, "")),
			"_blank",
			"chrome,all,resizable,centerscreen,modal",
			folderId, rootFolder, callback, this
		);
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

		var ws = this.wm.getEnumerator("navigator:browser");
		while(ws.hasMoreElements()) {
			let w = ws.getNext();
			if(w == window)
				continue;
			let btn = w.document.getElementById(this.button.id);
			btn && btn.bookmarks.initWithFolder(folder);
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
	}
};

this.type = "menu";
this.orient = "horizontal";
if(hideDropMarker) {
	let btn = this;
	let doc = btn.ownerDocument;
	let stopTime = Date.now() + 500;
	setTimeout(function hideDropMarker() { // Wait for menu XBL binding
		var dm = doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-menu-dropmarker");
		if(dm) {
			dm.hidden = true;
			let icon = doc.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-icon");
			if(icon) {
				let s = doc.defaultView.getComputedStyle(icon, null);
				if(s.paddingRight != s.paddingLeft) // Hack for Firefox 19 and large icons
					icon.style.paddingLeft = icon.style.paddingRight = s.paddingLeft;
			}
		}
		else if(Date.now() < stopTime)
			setTimeout(hideDropMarker, 10);
	}, 0);
}

setTimeout(function(_this) { // Don't show modal "Select folder" dialog during initialization
	_this.bookmarks.init();
}, 0, this);
this.onDestroy = function() {
	this.bookmarks.destroy();
};