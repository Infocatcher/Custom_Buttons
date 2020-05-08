// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/CustomizableUI.js
// Dummy wrapper to create Custom Buttons using CustomizableUI.jsm
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm

// See "//!" comments

(function () {
CustomizableUI.createWidget({
	id: "__cb_someCustomButton", //! Change to something unique
	type: "custom",
	// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm#Area_constants
	defaultArea: CustomizableUI.AREA_NAVBAR, //! Default toolbar
	onBuild: function(doc) {
		var btn = doc.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
		var id = this.id;
		var attrs = {
			id: id,
			class: "toolbarbutton-1 chromeclass-toolbar-additional",
			label: "Button name", //! Set label here
			tooltiptext: "Button tooltip", //! Set tooltip here
			style: 'list-style-image: url("chrome://branding/content/icon16.png");', //! Set icon here
			__proto__: null
		};
		for(var p in attrs)
			btn.setAttribute(p, attrs[p]);
		btn.addEventListener("command", function(e) {
			new win.Function("e",
				"("
				+ cbCode.toString()
					.replace("{", "{" + cbEnv(id))
				+ ").call(document.getElementById('" + id + "'), e);"
			)(e);
		}, false);
		var win = doc.defaultView;
		win.setTimeout(function() {
			new win.Function(
				"("
				+ cbInitialization.toString()
					.replace("{", "{" + cbEnv(id).replace("@code", "@init"))
				+ ").call(document.getElementById('" + id + "'));"
			)();
		}, 0);
		return btn;
	}
});

function cbEnv(id) {
	var envCode = ("" + function() {
		// Custom Buttons-like environment
		var event = arguments[0] || {};
		var xulns = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		var xhtmlns = "http://www.w3.org/1999/xhtml";
		function LOG(msg) {
			var head = "[Custom Buttons CustomizableUI.jsm: id: #id@code"
				+ ", line: " + Components.stack.caller.lineNumber + "]";
			Services.console.logStringMessage(head + "\n" + msg);
		}
	}).replace("#id", id).replace(/^[\s\S]+?\{|\}[^}]*?$/g, "");
	return envCode;
}

function cbCode() {
	//! Place code here
	LOG("cbCode()");
}
function cbInitialization() {
	//! Place initialization here
	LOG("cbInitialization()");
}

})();