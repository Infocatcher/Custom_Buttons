// http://infocatcher.ucoz.net/js/cb/purgeTabsHistory.js

// Purge Tab(s) History
// (c) Infocatcher 2009, 2011-2012
// version 0.3.0 - 2012-08-14

this.onclick = function(e) {
	if(e.button == 1 || e.button == 0 && (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey))
		this.historyManager.purgeBrowsersHistory(this.historyManager.visibleBrowsers);
	else if(e.button == 0)
		this.historyManager.purgeBrowserHistory();
};

var dummy = function() {};
this.historyManager = {
	button: this,
	initialized: false,
	init: function() {
		if(this.initialized)
			return;
		this.initialized = true;

		window.addEventListener(this.ssTabRestoredEvent, this, false);
		window.addEventListener("TabClose", this, false);
		window.addEventListener("unload", this, false);
		gBrowser.addProgressListener(this);

		this.updButtonStateDelayed();
		//this.updButtonStateDelayed(1000);
	},
	destroy: function() {
		if(!this.initialized)
			return;
		this.initialized = false;

		window.removeEventListener(this.ssTabRestoredEvent, this, false);
		window.removeEventListener("TabClose", this, false);
		window.removeEventListener("unload", this, false);
		gBrowser.removeProgressListener(this);
	},
	get ssTabRestoredEvent() {
		delete this.ssTabRestoredEvent;
		return this.ssTabRestoredEvent = "@mozilla.org/browser/sessionstore;1" in Components.classes
			? "SSTabRestored"
			: "TabOpen";
	},

	handleEvent: function(e) {
		switch(e.type) {
			case "TabOpen":
			case "SSTabRestored":
				this.updButtonStateDelayed(250); // Slow restoring during browser startup
			break;
			case "TabClose":
				this.updButtonStateDelayed();
			break;
			case "unload":
				this.destroy();
		}
	},

	QueryInterface: function(iid) {
		if(
			iid.equals(Components.interfaces.nsIWebProgressListener)
			|| iid.equals(Components.interfaces.nsISupportsWeakReference)
			|| iid.equals(Components.interfaces.nsISupports)
		)
			return this;
		throw Components.results.NS_NOINTERFACE;
	},
	onStateChange: dummy,
	onProgressChange: dummy,
	onLocationChange: function(aWebProgress, aRequest, aLocation) {
		this.updButtonStateDelayed();
	},
	onStatusChange: dummy,
	onSecurityChange: dummy,

	purgeBrowserHistory: function(browser) {
		if(!browser)
			browser = gBrowser.selectedBrowser;
		var sh = browser.sessionHistory
			.QueryInterface(Components.interfaces.nsISHistory)
			.QueryInterface(Components.interfaces.nsISHistoryInternal);
		var count = sh.count;
		if(!count)
			return;
		var indx = sh.index;
		var curEntry = indx > -1 ? sh.getEntryAtIndex(indx, false) : null;
		sh.PurgeHistory(count);
		curEntry && sh.addEntry(curEntry, true);
		if(arguments.length <= 1)
			this.upd();
	},
	purgeBrowsersHistory: function(browsers) {
		browsers.forEach(this.purgeBrowserHistory, this);
		this.upd();
	},

	upd: function() {
		this.forceSaveSession();
		this.updButtonState();
		this.updUI();
	},
	updUI: function() {
		if("UpdateBackForwardCommands" in window) // Firefox
			UpdateBackForwardCommands(gBrowser.webNavigation);
		else // SeaMonkey
			UpdateBackForwardButtons();
	},
	get visibleBrowsers() {
		if("visibleTabs" in gBrowser) {
			return gBrowser.visibleTabs.map(function(tab) {
				return tab.linkedBrowser;
			});
		}
		return gBrowser.browsers;
	},
	updButtonState: function() {
		this.button.disabled = !this.visibleBrowsers.some(function(browser) {
			return browser && browser.sessionHistory && browser.sessionHistory.count > 1;
		});
	},
	updButtonStateDelayed: function(delay) {
		setTimeout(function(_this) {
			_this.updButtonState();
		}, delay || 0, this);
	},
	_forceSaveSessionTimer: 0,
	forceSaveSession: function() {
		const key = "custombuttonsPurgeTabHistoryForceSaveSession";
		var ss = ( // Firefox or SeaMonkey
			Components.classes["@mozilla.org/browser/sessionstore;1"]
			|| Components.classes["@mozilla.org/suite/sessionstore;1"]
		).getService(Components.interfaces.nsISessionStore);
		ss.setWindowValue(window, key, Date.now());
		clearTimeout(this._forceSaveSessionTimer);
		this._forceSaveSessionTimer = setTimeout(function() {
			ss.deleteWindowValue(window, key);
		}, 20e3);
	}
};

this.onDestroy = function() {
	this.historyManager.destroy();
};
this.historyManager.init();