// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/CustomizableUI.js
// Dummy wrapper to create Custom Buttons using CustomizableUI.jsm
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm

(function () {

//== Configuration begin
var cb = {
	id: "someCustomButton", // Unique identifier
	fileInit: "someCustomButton.js", // Relative path to script file or empty string ("")
	fileCode: "", // Relative path to script file or empty string ("")
	label: "Button name",
	tooltip: "Button tooltip",
	icon: "chrome://branding/content/icon16.png",
	// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm#Area_constants
	defaultArea: CustomizableUI.AREA_NAVBAR // Default toolbar
};
//== Configuration end

var cbEnv = {
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
		event: codeEvent || new win.Object(),
		self: btn
	});
	context.LOG = context.LOG.bind(context);
	Object.defineProperty(context, "top", { value: win.top });
	var file = path + (codeEvent ? cb.fileCode : cb.fileInit);
	context.LOG("cbExec()\n" + file);
	Services.scriptloader.loadSubScript(file, context, "UTF-8");
}

CustomizableUI.createWidget({
	id: "__cb_" + cb.id,
	type: "custom",
	defaultArea: cb.defaultArea,
	onBuild: function(doc) {
		var btn = doc.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
		var id = cbEnv._id = this.id;
		var attrs = {
			id: id,
			class: "toolbarbutton-1 chromeclass-toolbar-additional",
			label: cb.label,
			tooltiptext: cb.tooltip,
			style: 'list-style-image: url("' + cb.icon + '");',
			__proto__: null
		};
		for(var p in attrs)
			btn.setAttribute(p, attrs[p]);
		var win = doc.defaultView;
		cb.fileCode && btn.addEventListener("command", function(e) {
			cbExec(win, btn, e);
		}, false);
		cb.fileInit && win.setTimeout(function() {
			cbExec(win, btn, false);
		}, 0);
		return btn;
	}
});

})();