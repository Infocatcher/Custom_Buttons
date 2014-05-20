// https://github.com/Infocatcher/Custom_Buttons/tree/master/Title_Bar

// Title Bar button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010, 2012, 2014
// version 0.2.3.1 - 2014-05-20

var flexibleWidth = true;

if(
	flexibleWidth
	&& Array.some(
		this.parentNode.childNodes,
		function(node) {
			if(node == this)
				return false;
			var flex = node.getAttribute("flex")
				|| node.ownerDocument.defaultView.getComputedStyle(node, null).MozBoxFlex;
			return flex > 0;
		},
		this
	)
) {
	LOG("Detected flexible nodes in the button level, will use fixed width");
	flexibleWidth = false;
}

var titleWidth, titleWidthMin, titleWidthMax, titleWidthCustomize;
if(flexibleWidth) {
	titleWidth = "auto";
	titleWidthMin = "100px";
	titleWidthMax = "none";
	titleWidthCustomize = titleWidthMin;
}
else {
	titleWidth = titleWidthMin = titleWidthMax = titleWidthCustomize = "350px";
}

var root = document.documentElement;
this.__savedTitle = null;
this.__defineSetter__("title", function(val) {
	if(val != this.__savedTitle)
		this.label = this.tooltipText = this.__savedTitle = val;
});

var titleUpdater = {
	button: this,
	_mo: null,
	init: function() {
		if("MutationObserver" in window) {
			var _this = this;
			var mo = this._mo = new MutationObserver(function() {
				_this.handleMutations.apply(_this, arguments);
			});
			// http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers
			mo.observe(root, {
				attributes: true,
				attributeFilter: ["title"]
			});
		}
		else {
			root.addEventListener("DOMAttrModified", this, true);
		}
	},
	destroy: function() {
		var mo = this._mo;
		if(mo) {
			this._mo = null;
			mo.disconnect();
		}
		else {
			root.removeEventListener("DOMAttrModified", this, true);
		}
	},
	handleMutations: function(mutations) {
		this.button.title = document.title;
	},
	handleEvent: function(e) {
		if(e.attrName == "title" && e.originalTarget == root)
			this.button.title = e.newValue;
	}
};

var dragHandler = {
	get sm() {
		delete this.sm;
		return this.sm = Components.classes["@mozilla.org/gfx/screenmanager;1"]
			.getService(Components.interfaces.nsIScreenManager);
	},
	handleEvent: function(e) {
		switch(e.type) {
			case "mousedown":
				if(e.button != 0)
					break;
				window.addEventListener("mouseup", this, true);
				window.addEventListener("keypress", this, true);
				window.addEventListener("mousemove", this, true);
				this.pos = {
					x: e.screenX,
					y: e.screenY
				};
				this.winPos = {
					x: window.screenX,
					y: window.screenY
				};
			break;
			case "mouseup":
				this.stopEvent(e);
				this.cancel();
			break;
			case "keypress":
				if(e.keyCode != e.DOM_VK_ESCAPE)
					break;
				this.stopEvent(e);
				window.moveTo(this.winPos.x, this.winPos.y);
				this.cancel();
			break;
			case "mousemove":
				let x = e.screenX;
				let y = e.screenY;
				if(this.sm.numberOfScreens == 1) {
					let edge = 10;
					x = Math.max(screen.availLeft + edge, Math.min(screen.availLeft + screen.availWidth  - edge, x));
					y = Math.max(screen.availTop  + edge, Math.min(screen.availTop  + screen.availHeight - edge, y));
				}
				window.moveTo(
					this.winPos.x + x - this.pos.x,
					this.winPos.y + y - this.pos.y
				);
		}
	},
	cancel: function() {
		window.removeEventListener("mouseup", this, true);
		window.removeEventListener("keypress", this, true);
		window.removeEventListener("mousemove", this, true);
		this.pos = this.winPos = null;
	},
	stopEvent: function(e) {
		e.preventDefault();
		e.stopPropagation();
	}
};
addEventListener("mousedown", dragHandler, true, this);
this.ondblclick = function(e) {
	if(e.button != 0)
		return;
	if("fullScreen" in window && window.fullScreen) {
		window.fullScreen = false;
		return;
	}
	if(window.windowState != window.STATE_NORMAL)
		window.restore();
	else
		window.maximize();
};

var s = document.documentElement.style;
var boxShadowPrefix = "boxShadow" in s ? "" : "-moz-";
var cssStr = ('\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	@-moz-document url("' + window.location.href + '") {\n\
		%button% {\n\
			width: ' + titleWidth + ' !important;\n\
			min-width: ' + titleWidthMin + ' !important;\n\
			max-width: ' + titleWidthMax + ' !important;\n\
			-moz-box-flex: 1 !important;\n\
			padding: 1px 3px !important;\n\
			-moz-box-pack: center !important;\n\
			-moz-box-orient: horizontal !important;\n\
			-moz-appearance: none !important;\n\
		}\n\
		%button%,\n\
		%button% > .toolbarbutton-text {\n\
			color: windowText !important;\n\
			text-shadow: window 2px -2px 4px, window -2px 2px 4px, window -2px -4px 4px, window 2px 4px 4px !important;\n\
			background: transparent !important;\n\
			border: none !important;\n\
			' + boxShadowPrefix + 'box-shadow: none !important;\n\
		}\n\
		%button% > .toolbarbutton-icon {\n\
			display: none !important;\n\
		}\n\
		%button% > .toolbarbutton-text {\n\
			display: -moz-box !important;\n\
			text-align: left !important;\n\
		}\n\
		toolbarpaletteitem > %button% {\n\
			min-width: ' + titleWidthCustomize + ' !important;\n\
			max-width: ' + titleWidthCustomize + ' !important;\n\
		}\n\
	}')
	.replace(/%button%/g, "#" + this.id);

var cssURI = makeURI("data:text/css," + encodeURIComponent(cssStr));
var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
	.getService(Components.interfaces.nsIStyleSheetService);
if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
	sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);
function removeStyles() {
	if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
		sss.unregisterSheet(cssURI, sss.USER_SHEET);
}

this.title = document.title;
titleUpdater.init();

this.onDestroy = function(reason) {
	titleUpdater.destroy();
	if(reason == "update" || reason == "delete")
		removeStyles()
	else if(reason == "constructor" && this.parentNode.nodeName == "toolbar")
		setTimeout(removeStyles, 0); // Only for "flexibleWidth = false" hack
};