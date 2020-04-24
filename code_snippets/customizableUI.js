// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/CustomizableUI.js
// Dummy wrapper to create Custom Buttons using CustomizableUI.jsm
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm

// See "//!" comments

(function () {
// Custom Buttons-like environment
var event = {};
var _id, _phase = "code";
var xulns = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var xhtmlns = "http://www.w3.org/1999/xhtml";
function LOG(msg) {
	var head = "[Custom Buttons CustomizableUI.jsm: id: " + _id + "@" + _phase
		+ ", line: " + Components.stack.caller.lineNumber + "]";
	Services.console.logStringMessage(head + "\n" + msg);
}

CustomizableUI.createWidget({
	id: "__cb_someCustomButton", //! Change to something unique
	type: "custom",
	// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm#Area_constants
	defaultArea: CustomizableUI.AREA_NAVBAR, //! Default toolbar
	onBuild: function(doc) {
		var btn = doc.createElementNS(xulns, "toolbarbutton");
		var attrs = {
			id: (_id = this.id),
			class: "toolbarbutton-1 chromeclass-toolbar-additional",
			label: "Button name", //! Set label here
			tooltiptext: "Button tooltip", //! Set tooltip here
			style: 'list-style-image: url("chrome://branding/content/icon16.png");', //! Set icon here
			__proto__: null
		};
		for(var p in attrs)
			btn.setAttribute(p, attrs[p]);
		btn.addEventListener("command", cbCode.bind(btn), false);
		doc.defaultView.setTimeout(function() {
			try {
				_phase = "init";
				cbInitialization.call(btn);
			}
			finally {
				_phase = "code";
			}
		}, 0);
		return btn;
	}
});

function cbCode() {
	//! Place code here
}
function cbInitialization() {
	//! Place initialization here
}

})();