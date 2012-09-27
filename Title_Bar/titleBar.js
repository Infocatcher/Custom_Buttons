// https://github.com/Infocatcher/Custom_Buttons/tree/master/Title_Bar

// Title Bar button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010, 2012
// version 0.2.0 - 2012-09-25

// Flexible width:
var titleWidth = "auto";
var titleWidthMin = "100px";
var titleWidthMax = "none";
/*
// Fixed width:
var titleWidth = "350px";
var titleWidthMin = titleWidth;
var titleWidthMax = titleWidth;
*/

var root = document.documentElement;
this.__savedTitle = null;
this.__defineSetter__("title", function(val) {
	if(val != this.__savedTitle)
		this.label = this.tooltipText = this.__savedTitle = val;
});

var titleUpdater = {
	button: this,
	handleMutations: function(mutations) {
		this.button.title = document.title;
	},
	handleEvent: function(e) {
		if(e.attrName == "title" && e.originalTarget == root)
			this.button.title = e.newValue;
	}
};
if("MutationObserver" in window) {
	var mo = new MutationObserver(titleUpdater);
	// http://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#mutation-observers
	mo.observe(root, {
		attributes: true,
		attributeFilter: ["title"]
	});
}
else {
	root.addEventListener("DOMAttrModified", titleUpdater, true);
}

var cssStr = ('\
	@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
	@-moz-document url("' + window.location.href + '") {\n\
		%button% {\n\
			color: windowText !important;\n\
			text-shadow: window 2px -2px 4px, window -2px 2px 4px, window -2px -4px 4px, window 2px 4px 4px !important;\n\
			width: ' + titleWidth + ' !important;\n\
			min-width: ' + titleWidthMin + ' !important;\n\
			max-width: ' + titleWidthMax + ' !important;\n\
			-moz-box-flex: 1 !important;\n\
			padding: 1px 3px !important;\n\
			-moz-box-pack: center !important;\n\
			-moz-box-orient: horizontal !important;\n\
			background: transparent !important;\n\
			-moz-box-shadow: none !important;\n\
			-moz-appearance: none !important;\n\
			border: none !important;\n\
		}\n\
		%button% > .toolbarbutton-icon {\n\
			display: none !important;\n\
		}\n\
		%button% > .toolbarbutton-text {\n\
			display: -moz-box !important;\n\
			text-align: left !important;\n\
		}\n\
		toolbarpaletteitem > %button% {\n\
			min-width: 200px !important;\n\
			max-width: 200px !important;\n\
		}\n\
	}')
	.replace(/%button%/g, "#" + this.id);

var cssURI = makeURI("data:text/css," + encodeURIComponent(cssStr));
var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
	.getService(Components.interfaces.nsIStyleSheetService);
if(!sss.sheetRegistered(cssURI, sss.USER_SHEET))
	sss.loadAndRegisterSheet(cssURI, sss.USER_SHEET);

this.title = document.title;

this.onDestroy = function(reason) {
	if(reason == "update" || reason == "delete") {
		if(sss.sheetRegistered(cssURI, sss.USER_SHEET))
			sss.unregisterSheet(cssURI, sss.USER_SHEET);
	}
};