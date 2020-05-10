// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/CustomizableUI.js
// Dummy wrapper to create Custom Buttons using CustomizableUI.jsm
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm

// See "//!" comments

(function () {

var cbInitFile = "someCustomButton.js"; //! Relative path to script file (initialization)
var cbCodeFile = ""; //! Relative path to script file (code)

var cbEnv = {
	_id: "?",
	_phase: "?",
	event: {},
	xulns: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
	xhtmlns: "http://www.w3.org/1999/xhtml",
	LOG: function(msg) {
		var head = "[Custom Buttons CustomizableUI.jsm: id: " + this._id + "@" + this._phase
			+ ", line: " + Components.stack.caller.lineNumber + "]";
		Services.console.logStringMessage(head + "\n" + msg);
	}
};

var path = new Error().fileName.replace(/[^\\\/]*$/, "");
function cbExec(win, btn, codeEvent) {
	// Note: be careful with global variables inside cb-script
	var context = Object.assign(btn, cbEnv, {
		_id: btn.id,
		_phase: codeEvent ? "code" : "init",
		event: codeEvent || {}
	});
	context.LOG = context.LOG.bind(context);
	var file = path + (codeEvent ? cbCodeFile : cbInitFile);
	context.LOG("cbExec()\n" + file);
	Services.scriptloader.loadSubScript(file, context, "UTF-8");
}

CustomizableUI.createWidget({
	id: "__cb_someCustomButton", //! Change to something unique
	type: "custom",
	// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm#Area_constants
	defaultArea: CustomizableUI.AREA_NAVBAR, //! Default toolbar
	onBuild: function(doc) {
		var btn = doc.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
		var id = cbEnv._id = this.id;
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
		var win = doc.defaultView;
		cbCodeFile && btn.addEventListener("command", function(e) {
			cbExec(win, btn, e);
		}, false);
		cbInitFile && win.setTimeout(function() {
			cbExec(win, btn, false);
		}, 0);
		return btn;
	}
});

})();