// http://infocatcher.ucoz.net/js/cb/window.js

// Open Window button for Custom Buttons
// /* Code */           - code for "Code" section
// /* Initialization */ - code for "Initialization" section

// (c) Infocatcher 2012
// version 0.1.1 - 2012-04-08


/* Code */
//this.linkedWindow.toggle();
this.linkedWindow.toggle([null, 0]); // Special call for Downloads
// Or
//this.linkedWindow.close() || BrowserDownloadsUI();


/* Initialization */
Components.utils.import("resource://gre/modules/Services.jsm");

function Window(uri, type) {
	this.uri = uri;
	this.type = type;
}
Window.prototype = {
	get: function() {
		if(this.type)
			return Services.wm.getMostRecentWindow(this.type);
		var ws = Services.wm.getEnumerator(null);
		while(ws.hasMoreElements()) {
			var w = ws.getNext();
			if(w.location.href == this.uri)
				return w;
		}
		return null;
	},
	open: function(params, features) {
		var w = this.get();
		if(w) {
			w.focus();
			return w;
		}
		var args = [this.uri, "_blank", features || "resizable,dialog=no,centerscreen"];
		if(params)
			args.push.apply(args, params);
		return window.openDialog.apply(window, args);
	},
	close: function() {
		var w = this.get();
		w && w.close();
		return w;
	},
	toggle: function() {
		return this.close() || this.open.apply(this, arguments);
	},
	setObserver: function(observer) {
		this.observer = observer;
		var w = this.get();
		w && this.notifyObserver(true, w);
		Services.ww.registerNotification(this);
	},
	removeObserver: function() {
		Services.ww.unregisterNotification(this);
		delete this.observer;
	},
	observe: function(subject, topic, data) {
		if(topic == "domwindowopened")
			subject.addEventListener("DOMContentLoaded", this, false);
		else if(topic == "domwindowclosed") {
			if(subject.location.href == this.uri)
				this.notifyObserver(false, subject);
		}
	},
	handleEvent: function(e) {
		if(e.type != "DOMContentLoaded")
			return;
		var window = e.originalTarget.defaultView;
		window.removeEventListener("DOMContentLoaded", this, false);
		if(window.location.href == this.uri)
			this.notifyObserver(true, window);
	},
	notifyObserver: function(opened, window) {
		var o = this.observer;
		"onWindowChanged" in o && o.onWindowChanged(opened, window);
		if(opened)
			"onWindowOpened" in o && o.onWindowOpened(window);
		else
			"onWindowClosed" in o && o.onWindowClosed(window);
	}
};

//var w = this.linkedWindow = new Window("chrome://passwordmgr/content/passwordManager.xul", "Toolkit:PasswordManager");
var w = this.linkedWindow = new Window("chrome://mozapps/content/downloads/downloads.xul", "Download:Manager");
w.setObserver({
	button: this,
	onWindowChanged: function(opened) {
		this.button.checked = opened;
	}
});
this.onDestroy = function() {
	this.linkedWindow.removeObserver();
};