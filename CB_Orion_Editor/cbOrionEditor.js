// https://github.com/Infocatcher/Custom_Buttons/tree/master/CB_Orion_Editor
// http://infocatcher.ucoz.net/js/cb/cbOrionEditor.js

// Orion Editor button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012-2013
// version 0.1.0a2 - 2013-09-09

const watcherId = "customButtonsOrionEditor_" + this.id;
var {Application, Components} = window; // Prevent garbage collection in Firefox 3.6 and older
var watcher = Application.storage.get(watcherId, null);
if(!watcher) {
	watcher = {
		REASON_STARTUP: 1,
		REASON_SHUTDOWN: 2,
		REASON_WINDOW_LOADED: 3,
		REASON_WINDOW_CLOSED: 4,

		get obs() {
			delete this.obs;
			return this.obs = Components.classes["@mozilla.org/observer-service;1"]
				.getService(Components.interfaces.nsIObserverService);
		},
		get ww() {
			delete this.ww;
			return this.ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				.getService(Components.interfaces.nsIWindowWatcher);
		},
		get wm() {
			delete this.wm;
			return this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator);
		},
		init: function(reason) {
			this.obs.addObserver(this, "quit-application-granted", false);
			var ws = this.wm.getEnumerator(null);
			while(ws.hasMoreElements())
				this.initWindow(ws.getNext(), reason);
			this.ww.registerNotification(this);
		},
		destroy: function(reason) {
			this.obs.removeObserver(this, "quit-application-granted");
			var ws = this.wm.getEnumerator(null);
			while(ws.hasMoreElements())
				this.destroyWindow(ws.getNext(), reason);
			this.ww.unregisterNotification(this);
		},
		initWindow: function(window, reason) {
			if(!this.isTargetWindow(window))
				return;
			var document = window.document;

			// See view-source:chrome://browser/content/devtools/scratchpad.xul
			// + view-source:chrome://browser/content/devtools/source-editor-overlay.xul
			var psXUL = ('<popupset id="orionEditorPopupset"\
				xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">\
				<menupopup id="orionEditorContext"\
					onpopupshowing="goUpdateSourceEditorMenuItems()">\
					<menuitem id="se-menu-undo"/>\
					<menuitem id="se-menu-redo"/>\
					<menuseparator/>\
					<menuitem id="se-menu-cut"/>\
					<menuitem id="se-menu-copy"/>\
					<menuitem id="se-menu-paste"/>\
					<menuseparator/>\
					<menuitem id="se-menu-selectAll"/>\
					<menuseparator/>\
					<menuitem id="se-menu-find"/>\
					<menuitem id="se-menu-findAgain"/>\
					<menuseparator/>\
					<menuitem id="se-menu-gotoLine"/>\
				</menupopup>\
			</popupset>')
			.replace(/>\s+</g, "><");
			var ps = new DOMParser().parseFromString(psXUL, "application/xml").documentElement;
			var cm = ps.firstChild;
			document.documentElement.appendChild(ps);

			window.setTimeout(function() {
				function appendNode(nodeName, id) {
					var node = document.createElement(nodeName);
					node.id = id;
					document.documentElement.appendChild(node);
				}
				appendNode("commandset", "editMenuCommands");
				appendNode("commandset", "sourceEditorCommands");
				appendNode("keyset", "sourceEditorKeys");
				appendNode("keyset", "editMenuKeys");
			}, 50);
			window.setTimeout(function() {
				document.loadOverlay("chrome://global/content/editMenuOverlay.xul", null);
				window.setTimeout(function() {
					document.loadOverlay("chrome://browser/content/devtools/source-editor-overlay.xul", null);
				}, 500);
			}, 700);

			Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
				.getService(Components.interfaces.mozIJSSubScriptLoader)
				.loadSubScript("chrome://global/content/globalOverlay.js", window);

			Components.utils.import("resource:///modules/source-editor.jsm", window);
			var SourceEditor = window.SourceEditor;

			Array.slice(document.getElementsByTagName("cbeditor")).forEach(function(cbEditor) {
				if("__orion" in cbEditor)
					return;
				var code = cbEditor.value;
				var se = new SourceEditor();
				var orionElt = document.createElement("hbox");
				orionElt.className = "orionEditor";
				orionElt.setAttribute("flex", 1);
				orionElt.__orion = se;
				cbEditor.parentNode.insertBefore(orionElt, cbEditor);
				//cbEditor.setAttribute("hidden", "true");
				cbEditor.setAttribute("collapsed", "true");
				cbEditor.parentNode.appendChild(cbEditor);
				cbEditor.__orion = se;
				cbEditor.__orionElt = orionElt;
				cbEditor.__defineGetter__("value", function() {
					if("__orion" in this) {
						var orion = this.__orion;
						if(!orion.__initialized)
							return orion.__value;
						return orion.getText().replace(/\r\n?|\n\r?/g, "\n");
					}
					return this.textbox.value;
				});
				cbEditor.__defineSetter__("value", function(v) {
					if("__orion" in this) {
						var orion = this.__orion;
						if(!orion.__initialized) {
							var _this = this;
							orion.__onLoadCallbacks.push(function() {
								_this.value = v;
							});
							return orion.__value = v;
						}
						return orion.setText(v.replace(/\r\n?|\n\r?/g, "\n"));
					}
					return this.textbox.value = v;
				});
				cbEditor.selectLine = function(lineNumber) {
					if("__orion" in this) {
						var orion = this.__orion;
						if(!orion.__initialized) {
							var _this = this, args = arguments;
							orion.__onLoadCallbacks.push(function() {
								_this.selectLine.apply(_this, args);
							});
							return undefined;
						}
						var ss = orion.getLineStart(lineNumber - 1);
						var se = orion.getLineEnd(lineNumber - 1, false);
						orion.focus();
						return orion.setSelection(ss, se);
					}
					return this.__proto__.selectLine.apply(this, arguments);
				};
				se.__initialized = false;
				se.__onLoadCallbacks = [];
				se.__value = code;
				se.init(
					orionElt,
					{
						mode: SourceEditor.MODES.JAVASCRIPT,
						showLineNumbers: true,
						initialText: code,
						placeholderText: code, // For backward compatibility
						contextMenu: "orionEditorContext"
					},
					function callback() {
						se.__initialized = true;
						se.__onLoadCallbacks.forEach(function(fn) {
							try {
								fn();
							}
							catch(e) {
								Components.utils.reportError(e);
							}
						});
						delete se.__onLoadCallbacks;
						delete se.__value;

						// Hack to use selected editor
						var controller = se.ui._controller;
						var tabs = document.getElementById("custombuttons-editbutton-tabbox");
						controller.__defineGetter__("_editor", function() {
							var orionElt = tabs.selectedPanel;
							var orion = orionElt && orionElt.__orion
								|| document.getElementsByTagName("cbeditor")[0].__orion;
							return orion;
						});
						controller.__defineSetter__("_editor", function() {});
					}
				);
			}, this);

			window.addEventListener("load", function ensureObserversAdded() {
				window.removeEventListener("load", ensureObserversAdded, false);
				window.setTimeout(function() { window.editor.removeObservers(); }, 0);
				window.setTimeout(function() { window.editor.addObservers();    }, 0);
			}, false);
		},
		destroyWindow: function(window, reason) {
			if(reason == this.REASON_WINDOW_CLOSED)
				window.removeEventListener("DOMContentLoaded", this, false); // Window can be closed before DOMContentLoaded
			if(!this.isTargetWindow(window))
				return;
			var document = window.document;

			if(reason == this.REASON_SHUTDOWN) {
				[
					"orionEditorPopupset",
					"editMenuCommands",
					"sourceEditorCommands",
					"sourceEditorKeys",
					"editMenuKeys"
				].forEach(function(id) {
					var node = document.getElementById(id);
					node && node.parentNode.removeChild(node);
				});
				[
					// chrome://global/content/globalOverlay.js
					"closeWindow", "canQuitApplication", "goQuitApplication", "goUpdateCommand", "goDoCommand",
					"goSetCommandEnabled", "goSetMenuValue", "goSetAccessKey", "goOnEvent", "visitLink",
					"setTooltipText", "NS_ASSERT",
					// chrome://global/content/editMenuOverlay.xul => view-source:chrome://global/content/editMenuOverlay.js
					"goUpdateGlobalEditMenuItems", "goUpdateUndoEditMenuItems", "goUpdatePasteMenuItems"
				].forEach(function(p) {
					delete window[p];
				});
				Array.slice(document.getElementsByTagName("cbeditor")).forEach(function(cbEditor) {
					if(!("__orion" in cbEditor))
						return;
					var val = cbEditor.value;
					delete cbEditor.value;
					delete cbEditor.selectLine;

					var orionElt = cbEditor.__orionElt;
					orionElt.parentNode.insertBefore(cbEditor, orionElt);
					orionElt.parentNode.removeChild(orionElt);
					delete cbEditor.__orionElt;
					delete cbEditor.__orion;
					delete orionElt.__orion;

					cbEditor.value = val;
					window.setTimeout(function() {
						cbEditor.removeAttribute("collapsed");
					}, 0);
				}, this);
				delete window.SourceEditor;
			}
		},
		isTargetWindow: function(window) {
			return window.location.href.substr(0, 41) == "chrome://custombuttons/content/editor.xul";
		},
		observe: function(subject, topic, data) {
			if(topic == "quit-application-granted")
				this.destroy();
			else if(topic == "domwindowopened")
				subject.addEventListener("DOMContentLoaded", this, false);
			else if(topic == "domwindowclosed")
				this.destroyWindow(subject, this.REASON_WINDOW_CLOSED);
		},
		handleEvent: function(e) {
			var trg = e.originalTarget || e.target;
			var window;
			switch(e.type) {
				case "DOMContentLoaded":
					window = trg.defaultView;
					window.removeEventListener("DOMContentLoaded", this, false);
					this.initWindow(window, this.REASON_WINDOW_LOADED);
			}
		}
	};
	Application.storage.set(watcherId, watcher);
	setTimeout(function() {
		watcher.init(watcher.REASON_STARTUP);
	}, 50);
}
this.onDestroy = function(reason) {
	if(reason == "update" || reason == "delete") {
		watcher.destroy(watcher.REASON_SHUTDOWN);
		Application.storage.set(watcherId, null);
	}
};