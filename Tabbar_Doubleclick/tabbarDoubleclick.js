// http://infocatcher.ucoz.net/js/cb/tabbarDoubleclick.js

// Tabbar doubleclick action example for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2012
// version 0.1.0 - 2012-02-05

var tabbarHandler = {
	init: function() {
		addEventListener("dblclick", this, true);
	},
	handleEvent: function(e) {
		var tabbar = this.getTabbar(e.originalTarget);
		if(!tabbar)
			return;
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation && e.stopImmediatePropagation();
		LOG("tabbarHandler => " + e.type + " => BrowserOpenTab()");
		BrowserOpenTab();
	},
	getTabbar: function(it) {
		if(!it || !it.localName)
			return null;
		if(it.namespaceURI != "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul")
			return null;
		var itln = it.localName.toLowerCase();
		if(itln == "toolbarbutton")
			return null;
		if(itln == "toolbarspacer") { // <toolbarspacer/><tabs/><toolbarspacer/> in Firefox 4
			var tabsId = "tabbrowser-tabs";
			for(var tabs = it.nextSibling; tabs; tabs = tabs.nextSibling) {
				if(tabs.id == tabsId)
					return tabs;
				if(tabs.localName != "toolbarspacer")
					break;
			}
			for(var tabs = it.previousSibling; tabs; tabs = tabs.previousSibling) {
				if(tabs.id == tabsId)
					return tabs;
				if(tabs.localName != "toolbarspacer")
					break;
			}
			return null;
		}
		const docNode = Node.DOCUMENT_NODE; // 9
		for(; it && it.nodeType != docNode; it = it.parentNode) {
			itln = it.localName.toLowerCase();
			if(itln == "tab" || itln == "toolbarbutton")
				return null;
			if(/(?:^|\s)tabbrowser-tabs(?:\s|$)/.test(it.className))
				return it;
		}
		return null;
	}
};
tabbarHandler.init();