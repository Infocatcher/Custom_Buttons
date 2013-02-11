// https://github.com/Infocatcher/Custom_Buttons/tree/master/Convert_E4X
// https://forum.mozilla-russia.org/viewtopic.php?id=56442
// http://custombuttons.sf.net/forum/viewtopic.php?f=2&t=365

// Convert E4X button for Custom Buttons
// Code for "code" section

// (c) Infocatcher 2012-2013
// version 0.1.0a8 - 2013-02-05

// Tries convert deprecated E4X to string literals.
// Click on button and then click on another button with E4X in code (or click on opened page with *.js file).

var btn = this;
btn.checked = true;
addEventListener("click", function getButton(e) {
	var trg = e.target;

	var codes;
	if(trg.localName == "toolbarbutton" && /^custombuttons-button\d+$/.test(trg.id))
		codes = [trg.cbCommand, trg.cbInitCode];
	else if(
		trg.ownerDocument.defaultView == content
		&& /^(?:application\/(?:x-)?javascript|text\/plain)$/.test(trg.ownerDocument.contentType)
	)
		codes = [trg.ownerDocument.body.textContent];

	if(!codes)
		return;
	removeEventListener(e.type, getButton, true);
	e.preventDefault();
	e.stopPropagation();
	btn.checked = false;
	if(trg != btn)
		codes.forEach(convertCode);
}, true);

function convertCode(s) {
	if(!s || s == "/*CODE*/" || s == "/*Initialization Code*/")
		return;
	var orig = s;

	// Replace old parsers
	// Note: declarations of old perser functions aren't removed!
	s = s.replace(/(?:[\w$]+\s*\.\s*)*(?:makeXML|parseFromXML)(\s*)\(/g, "e4xConv_parseXULFromString$1(");

	// Convert node.@attr = ...
	s = s.replace(/(\.\s*)@([\w$]+)\s*=\s*([^;]+)/g, '$1setAttribute("$2", $3)');

	// Other node.@attr usage
	s = s.replace(/(\.\s*)@([\w$]+)/g, '$1getAttribute("$2")');

	s = s
		// <> ... </>
		.replace(/<>([\s\S]+?)<\/>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s, e4x) {
			if(e4x.substr(0, 9) == "<![CDATA[")
				return s;
			LOG("<> ... </>\n" + s);
			return convertE4X(e4x);
		})
		// <![CDATA[ ... ]]>
		.replace(/(?:<>)?<!\[CDATA\[([\s\S]+?)\]\]>(?:<\/>)?(?:\s*\.\s*toString\s*\(\))?/g, function(s, cdata) {
			if(inE4X(RegExp.leftContext))
				return s;
			LOG("<![CDATA[ ... ]]>\n" + s);
			return convertCDATA(cdata);
		})
		// <tag ... />
		.replace(/<\w+\s([^>]+?)\/>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
			if(inE4X(RegExp.leftContext))
				return s;
			LOG("<tag ... />\n" + s);
			return convertE4X(s);
		})
		// <tag> ... </tag>
		//.replace(/<(\w+)(?:[^>]*[^>\/])?>([\s\S]*?)<\/\1>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
		.replace(getTagsPattern(), function(s) {
			if(inE4X(RegExp.leftContext))
				return s;
			LOG("<tag> ... </tag>\n" + s);
			return convertE4X(s);
		})
		// All .toXMLString() calls are useless
		// Example:
		// window.openDialog("data:application/vnd.mozilla.xul+xml," + encodeURIComponent(dialog.toXMLString()), ...
		.replace(/\s*\.\s*toXMLString\s*\(\)/g, "");

	if(s != orig) {
		if(/\WXML\s*\.\s*\w/.test(orig)) {
			s = s.replace(
				/^(?:\/\*(?:CODE|Initialization Code)\*\/\n?)?/,
				"$&var XML = window.XML || {};\n\n"
			);
		}
		var addFuncs = "";
		if(s.indexOf("e4xConv_parseXULFromString") != -1)
			addFuncs += "\n" + e4xConv_parseXULFromString;
		if(s.indexOf("e4xConv_encodeHTML") != -1)
			addFuncs += "\n" + e4xConv_encodeHTML;
		if(addFuncs)
			s += "\n" + addFuncs;
		out(s);
	}
}
function getTagsPattern() {
	// I'm too lazy to write a real tags parser, sorry...
	const recursion = 7;
	const tagStart = "<(\\w+)(?:[^>]*[^>\\/])?>";

	function getSub(level) {
		if(++level > recursion)
			return "[\\s\\S]*?";
		return "(?:"
			+ "<\\w+[^>]*\\/>"
			+ "|" + tagStart + getSub(level) + "<\\/\\" + level + ">"
			+ "|[\\s\\S]"
			+ ")*?";
	}
	var pattern = tagStart
		+ getSub(1)
		+ "<\\/\\1>"
		+ "(?:\\s*\\.\\s*toXMLString\\s*\\(\\))?";

	var re = new RegExp(pattern, "g");
	getTagsPattern = function() {
		return re;
	};
	return re;
}
function convertCDATA(s) {
	return "'" + escapeString(s.replace(/['\\]/g, "\\$&")) + "'";
}
function inE4X(prev) {
	return />\s*(?:\\n\\[\n\r]\s*)?$/.test(prev);
}
function convertE4X(s) {
	var cdates = [];
	var rndCd = rnd();
	// Leave CDATA as is
	s = s.replace(/<!\[CDATA\[[\s\S]+?\]\]>/g, function(s) {
		//cdates.push("\\x3" + s.substr(1)); // Very simple way to break CDATA
		cdates.push(s);
		return rndCd;
	});

	// Extract codes
	var codes = [];
	var rndExpr = rnd();
	// { expressions }
	s = s.replace(/(=\s*)?\{([^\}]*)\}/g, function(s, eq, code) {
		//~ todo: don't add ( ... ) for foo, this.foo, this[foo] and foo("something") ?
		var isAttr = !!RegExp.$1;
		code = "e4xConv_encodeHTML(" + code + (isAttr ? ", true" : "") + ")";
		var q = eq ? '"' : "";
		code = q + "' + " + code + " + '" + q;
		codes.push(code);
		return eq + rndExpr;
	});

	// Restore CDATA
	var i = 0;
	s = s.replace(new RegExp(rndCd, "g"), function(s) {
		return cdates[i++];
	});

	s = escapeString(s);

	// Restore codes
	var i = 0;
	s = s.replace(new RegExp(rndExpr, "g"), function(s) {
		return codes[i++];
	});
	return "'" + s + "'";
}
function escapeString(s) {
	return s
		.replace(/['\\]/g, "\\$&")
		.replace(/$/mg, "\\n\\")
		.replace(/^\\n(\\[\n\r])/, "$1")
		.slice(0, -3);
}
function rnd() {
	return Date.now()
		+ Math.random().toFixed(14).substr(2)
		+ Math.random().toFixed(14).substr(2);
}
function out(s) {
	var uri = "data:text/plain;charset=utf-8," + encodeURIComponent(s);
	gBrowser.selectedTab = gBrowser.addTab(uri, makeURI("about:blank"));
}

function e4xConv_parseXULFromString(xul) {
	xul = xul.replace(/>\s+</g, "><");
	return new DOMParser().parseFromString(xul, "application/xml").documentElement;
}
function e4xConv_encodeHTML(s, isAttr) {
	s = String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
	if(isAttr) {
		s = s
			.replace(/\t/g, "&#x9;")
			.replace(/\n/g, "&#xA;")
			.replace(/\r/g, "&#xD;");
	}
	return s;
}