// https://github.com/Infocatcher/Custom_Buttons/tree/master/CB_Orion_Editor
// http://infocatcher.ucoz.net/js/cb/cbOrionEditor.js

// Orion Editor button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012-2013
// version 0.1.0a2pre - 2013-08-30

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

			Components.utils.import("resource:///modules/source-editor.jsm", this);
			Array.slice(document.getElementsByTagName("cbeditor")).forEach(function(cbEditor) {
				if("__orion" in cbEditor)
					return;
				var se = new this.SourceEditor();
				var orionElt = document.createElement("hbox");
				orionElt.className = "orionEditor";
				orionElt.setAttribute("flex", 1);
				cbEditor.parentNode.insertBefore(orionElt, cbEditor);
				//cbEditor.setAttribute("hidden", "true");
				cbEditor.setAttribute("collapsed", "true");
				cbEditor.parentNode.appendChild(cbEditor);
				cbEditor.__orion = se;
				cbEditor.__orionElt = orionElt;
				var code = cbEditor.value;
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
				se.__initialized = false;
				se.__onLoadCallbacks = [];
				se.__value = code;
				se.init(
					orionElt,
					{
						mode: this.SourceEditor.MODES.JAVASCRIPT,
						showLineNumbers: true,
						initialText: code,
						placeholderText: code // For backward compatibility
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
				Array.slice(document.getElementsByTagName("cbeditor")).forEach(function(cbEditor) {
					if(!("__orion" in cbEditor))
						return;
					var orionElt = cbEditor.__orionElt;
					orionElt.parentNode.insertBefore(cbEditor, orionElt);
					orionElt.parentNode.removeChild(orionElt);
					delete cbEditor.__orionElt;
					delete cbEditor.__orion;
				}, this);
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
	watcher.init(watcher.REASON_STARTUP);
}
this.onDestroy = function(reason) {
	if(reason == "update" || reason == "delete") {
		watcher.destroy(watcher.REASON_SHUTDOWN);
		Application.storage.set(watcherId, null);
	}
};