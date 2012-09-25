// https://github.com/Infocatcher/Custom_Buttons/tree/master/Title_Bar

// Title Bar button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2010
// version 0.1.0 - 2010-05-14

this.__defineSetter__("title", function(val) {
	if(val == this.__savedTitle)
		return;
	this.__savedTitle = val;
	this.setAttribute("label", val);
	this.tooltipText = val;
});

var titleUpdater = {
	button: this,
	handleEvent: function(e) {
		if(e.attrName != "title" || e.originalTarget != document.documentElement)
			return;
		this.button.title = e.newValue;
		//setTimeout(function() { throw new Error(">> " + e.newValue); }, 0);
	}
};
document.documentElement.addEventListener("DOMAttrModified", titleUpdater, true);
this.__savedTitle = this.title = document.title;


var sId = "__customButtonsStyle__" + this.id; // Unique style "id"
var cssStr = <><![CDATA[
	%button% {
		color: windowText !important;
		text-shadow: window 2px -2px 4px, window -2px 2px 4px, window -2px -4px 4px, window 2px 4px 4px !important;
		-moz-box-align: start !important;

		background: transparent !important;
		-moz-box-shadow: none !important;
		-moz-appearance: none !important;
		border: none !important;
		/* width: auto !important; */
		width: 350px !important;
	}
	%button% > image {
		display: none !important;
	}
	%button% > label {
		display: -moz-box !important;
	}
	]]></>.toString()
	.replace(/%button%/g, "#" + this.id);

function sheet(cssStr, removeFlag) {
	var cc = Components.classes;
	var sss = cc["@mozilla.org/content/style-sheet-service;1"]
		.getService(Components.interfaces.nsIStyleSheetService);
	var ios = cc["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var data = "data:text/css," + encodeURIComponent(cssStr);
	var uri = ios.newURI(data, null, null);
	if(sss.sheetRegistered(uri, sss.USER_SHEET))
		sss.unregisterSheet(uri, sss.USER_SHEET);
	if(removeFlag)
		return;
	sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
	window[sId] = cssStr;
}
if(!(sId in window))
	sheet(cssStr);
else if(window[sId] != cssStr) {
	sheet(window[sId], true);
	sheet(cssStr);
}