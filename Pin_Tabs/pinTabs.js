// http://infocatcher.ucoz.net/js/cb/pinTabs.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Pin_Tabs

// Pin Tabs button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010, 2012
// version 0.1.2 - 2012-10-12

// Left-click: pin/unpin current tab
// Middle-click: toggle autopin

//== Settings begin
this.startupAutoPin = false;
// See https://developer.mozilla.org/en/XUL_Tutorial/Keyboard_Shortcuts#Key_element
addKey(this, "toggleTabPinned",  "control q");
addKey(this, "toggleTabsPinned", "control shift q");
addKey(this, "toggleAutoPin",    "control alt q");
//== Settings end

this.toggleTabPinned = function(tab) {
	tab = tab || gBrowser.selectedTab;
	gBrowser[tab.pinned ? "unpinTab" : "pinTab"](tab);
};
this.toggleTabsPinned = function(pin) {
	var tabs = Array.prototype.slice.call(gBrowser.visibleTabs || gBrowser.tabs);
	pin = arguments.length
		? pin
		: tabs.some(function(tab) { return !tab.pinned; });
	if(!pin)
		tabs = tabs.reverse();
	var action = pin ? "pinTab" : "unpinTab";
	tabs.forEach(function(tab) {
		gBrowser[action](tab);
	});
};
this.evtHahdler = {
	button: this,
	handleEvent: function(e) {
		gBrowser.pinTab(e.target);
	}
};
this._autoPin = false;
this.toggleAutoPin = function() {
	this._autoPin = !this._autoPin;
	var tc = gBrowser.tabContainer;
	tc[this._autoPin ? "addEventListener" : "removeEventListener"]("TabOpen", this.evtHahdler, false);
	this.checked = this._autoPin;
};
this.onDestroy = function() {
	this._autoPin && this.toggleAutoPin();
};
this.onclick = function(e) {
	if(e.button == 1 || e.button == 0 && (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey))
		this.toggleAutoPin();
	else if(e.button == 0)
		this.toggleTabsPinned();
};
if(this.startupAutoPin) {
	this.toggleTabsPinned(true);
	this.toggleAutoPin();
}

function addKey(button, cmd, keyStr) {
	if(!addKey.hasOwnProperty("keyset")) {
		let kId = "custombuttons-keyset";
		let keyset = document.getElementById(kId);
		if(!keyset) {
			keyset = document.createElement("keyset");
			keyset.id = kId;
			document.documentElement.appendChild(keyset);
		}
		addKey.keyset = keyset;
	}
	var keyElt = document.createElement("key");
	keyElt.id = "custombuttons-key-" + cmd;
	keyElt.__button = button;
	keyElt.setAttribute("oncommand", "this.__button." + cmd + "();");
	var tokens = keyStr.split(" ");
	var key = tokens.pop() || " ";
	var modifiers = tokens.join(",");
	keyElt.setAttribute(key.indexOf("VK_") == 0 ? "keycode" : "key", key);
	keyElt.setAttribute("modifiers", modifiers);
	addKey.keyset.appendChild(keyElt);
}