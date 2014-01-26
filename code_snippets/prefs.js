// https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/prefs.js
// Simple preferences, that syncs with about:config
// Warning: this is test version, use at your own risk!

const prefNS = "extensions.custombuttons.buttons.coolButton.";
// Also see https://github.com/Infocatcher/Custom_Buttons/blob/master/code_snippets/prefNS.js
// for better namespace, if you wish to use many copies of button

// Some options:
var options = {
	a: 0,
	b: 1,
	sub: {
		c: 2,
		d: "something",
		e: true
	},
	array: ["a", "b"],
	pattern: /^some RegExp/i
};
makePrefable(this, options, prefNS);

// Now just use options.a to get (possible changed) value:
alert(options.a);

function makePrefable(btn, options, ns) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.QueryInterface(Components.interfaces.nsIPrefBranch2 || Components.interfaces.nsIPrefBranch);
	var db = prefs.getDefaultBranch("");
	parseObject(options, ns);
	if(btn && btn instanceof XULElement && "init" in btn && "destroy" in btn) {
		sync.__timer = 0;
		var syncObserver = { observe: sync };
		prefs.addObserver(ns, syncObserver, false);
		addDestructor(function() {
			prefs.removeObserver(ns, syncObserver);
		});
	}
	function parseObject(o, base) {
		for(var p in o) if(o.hasOwnProperty(p)) {
			var v = o[p];
			var t = typeof v;
			if(
				t == "boolean" || t == "number" || t == "string"
				|| v instanceof Array
				|| v instanceof RegExp
			)
				makeGetter(o, p, base + p, v);
			else if(v && t == "object")
				parseObject(v, base + p + ".");
		}
	}
	function makeGetter(o, p, n, dv) {
		o.__defineGetter__(p, function() {
			var v = get(n, dv);
			delete o[p];
			return o[p] = v == dv ? v : parse(v, dv);
		});
		setTimeout(function() {
			set(n, serialize(dv), db);
		}, 10);
	}
	function parse(v, dv) {
		if(dv instanceof Array)
			return JSON.parse(v);
		if(dv instanceof RegExp && /^\/(.+)\/(\w+)$/.test(v))
			return new RegExp(RegExp.$1, RegExp.$2);
		return v;
	}
	function serialize(v) {
		if(v instanceof Array)
			return JSON.stringify(v);
		if(v instanceof RegExp)
			return "" + v;
		return v;
	}
	function sync(subject, topic, n) {
		clearTimeout(sync.__timer);
		sync.__timer = setTimeout(function() {
			btn.destroy("update");
			btn.init();
		}, 50);
	}
	function get(n, dv, pb) {
		var ps = pb || prefs;
		switch(ps.getPrefType(n)) {
			case ps.PREF_BOOL:   return ps.getBoolPref(n);
			case ps.PREF_INT:    return ps.getIntPref(n);
			case ps.PREF_STRING: return ps.getComplexValue(n, Components.interfaces.nsISupportsString).data;
		}
		return dv;
	}
	function set(n, v, pb) {
		var ps = pb || prefs;
		var pType = ps.getPrefType(n);
		if(pType == ps.PREF_INVALID)
			pType = getValueType(v);
		switch(pType) {
			case ps.PREF_BOOL:   ps.setBoolPref(n, v); break;
			case ps.PREF_INT:    ps.setIntPref(n, v);  break;
			case ps.PREF_STRING:
				var ss = Components.interfaces.nsISupportsString;
				var s = Components.classes["@mozilla.org/supports-string;1"]
					.createInstance(ss);
				s.data = v;
				ps.setComplexValue(n, ss, s);
		}
	}
	function getValueType(v) {
		switch(typeof v) {
			case "boolean": return prefs.PREF_BOOL;
			case "number":  return prefs.PREF_INT;
		}
		return prefs.PREF_STRING;
	}
}