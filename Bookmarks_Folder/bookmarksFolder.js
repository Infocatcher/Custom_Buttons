// http://infocatcher.ucoz.net/js/cb/bookmarks.js

// Bookmarks Folder button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011-2012
// version 0.1.0pre10 - 2012-09-10

// Compatibility: Firefox 4.0+
// Button works in SeaMonkey, but missing GUI for select bookmarks folder

// Icon by FatCow Web Hosting: http://www.iconfinder.com/icondetails/36059/16/

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
		var mp = document.createElement("menupopup");
		mp.setAttribute("context", "placesContext");
		mp.setAttribute("placespopup", "true");
		var placeURI = "place:folder=" + folder + "&amp;excludeItems=0&amp;expandQueries=0";
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
	selectFolder: function() {
		// https://developer.mozilla.org/en/Displaying_Places_information_using_views
		var rootFolder = PlacesUIUtils.allBookmarksFolderId;
		var winSrc = '\
			<?xml version="1.0"?>\
			<?xml-stylesheet href="chrome://global/skin/" type="text/css"?>\
			<?xml-stylesheet href="chrome://browser/content/places/places.css"?>\
			<?xml-stylesheet href="chrome://browser/skin/places/places.css"?>\
			<?xul-overlay href="chrome://browser/content/places/placesOverlay.xul"?>\
			<dialog xmlns="' + xulns + '"\
				id="' + this.button.id + "-dialog" + '"\
				windowtype="' + this.button.id + ":dialog" + '"\
				title="' + _localize("Select folder") + '"\
				buttons="accept,cancel"\
				onload="init();"\
				ondialogaccept="return dialogCallback();"\
				width="400"\
				height="350">\
				<keyset>\
					<key id="key-accept" keycode="VK_RETURN" modifiers="control"\
						oncommand="document.documentElement.acceptDialog();" />\
				</keyset>\
				<tree id="tree" type="places"\
					place="' + "place:excludeItems=1&amp;excludeQueries=1&amp;folder=" + rootFolder + '"\
					hidecolumnpicker="true" seltype="single" flex="1"\
					onselect="onSelect();">\
					<treecols>\
						<treecol id="title" flex="1" primary="true" hideheader="true" />\
					</treecols>\
					<treechildren />\
				</tree>\
				<checkbox id="root" label="' + _localize("Root folder") + '" oncommand="onSelect();" />\
				<script type="application/javascript"><![CDATA[\
				var [folderId, rootFolder, callback, context] = window.arguments;\
				var tree = document.getElementById("tree");\
				var root = document.getElementById("root");\
				function init() {\
					if(folderId == rootFolder)\
						root.checked = true;\
					else if(folderId != undefined) {\
						tree.selectItems([folderId]);\
						var i = tree.view.selection.currentIndex;\
						if(i != -1) {\
							setTimeout(function() {\
								tree.treeBoxObject.ensureRowIsVisible(i);\
							}, 0);\
						}\
					}\
					onSelect();\
				}\
				function onSelect(dis) {\
					if(!arguments.length)\
						dis = !root.checked && !tree.view.selection.getRangeCount();\
					document.documentElement.getButton("accept").disabled = dis;\
					disableTree(root.checked);\
				}\
				function disableTree(dis) {\
					if(dis) {\
						tree.style.opacity = "0.6";\
						tree.setAttribute("disabled", "true");\
					}\
					else {\
						tree.style.opacity = "";\
						tree.removeAttribute("disabled");\
					}\
				}\
				function dialogCallback() {\
					if(root.checked)\
						var id = rootFolder;\
					else {\
						var view = tree.view;\
						var i = view.selection.currentIndex;\
						if(i == -1)\
							return false;\
						var item = view.nodeForTreeIndex(i);\
						if(item) {\
							var id = /place:folder=(\\w+)/.test(item.uri)\
								? RegExp.$1\
								: item.itemId;\
						}\
					}\
					callback.call(context, id);\
					return true;\
				}\
				onSelect(false);\
				]]></script>\
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
		this.folder = folder;
		this.destroy();
		var mp = this.button.firstChild;
		mp.setAttribute(
			"onpopupshowing",
			mp.getAttribute("onpopupshowing")
				.replace(/(place:folder=)\w+/, "$1" + folder)
		);
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
setTimeout(function(_this) { // Don't show modal "Select folder" dialog during initialization
	_this.bookmarks.init();
}, 0, this);
this.onDestroy = function() {
	this.bookmarks.destroy();
};
this.type = "menu";
this.orient = "horizontal";
if(hideDropMarker) setTimeout(function(btn) { // Wait for menu XBL binding
	let dm = btn.ownerDocument.getAnonymousElementByAttribute(btn, "class", "toolbarbutton-menu-dropmarker");
	if(dm)
		dm.hidden = true;
}, 0, this);