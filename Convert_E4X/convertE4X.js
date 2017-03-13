// https://github.com/Infocatcher/Custom_Buttons/tree/master/Convert_E4X
// https://forum.mozilla-russia.org/viewtopic.php?id=56442
// http://custombuttons.sf.net/forum/viewtopic.php?f=2&t=365

// Convert E4X button for Custom Buttons
// Code for "code" section

// (c) Infocatcher 2012-2013, 2016
// version 0.1.0b1pre3 - 2016-03-23

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
	try {
		e.preventDefault();
		e.stopPropagation();
	}
	catch(e) { // TypeError: 'preventDefault' called on an object that does not implement interface Event
		Components.utils.reportError(e);
	}
	btn.checked = false;
	if(trg != btn) codes.forEach(function(code) {
		code = convertCode(code);
		if(!code) // Nothing to convert
			return;
		var uri = "data:text/plain;charset=utf-8," + encodeURIComponent(code);
		gBrowser.selectedTab = gBrowser.addTab(uri, makeURI("about:blank"));
	});
}, true);

function convertCode(s) {
	if(!s || s == "/*CODE*/" || s == "/*Initialization Code*/")
		return "";
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
			if(inE4X(RegExp.leftContext) || alreadyConverted(cdata))
				return s;
			LOG("<![CDATA[ ... ]]>\n" + s);
			return convertCDATA(cdata);
		})
		// <tag ... />
		.replace(/<\w+\s([^>]+?)\/>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
			if(inE4X(RegExp.leftContext) || alreadyConverted(s) || /^(?:\\n)?\\[\n\r]/.test(RegExp.rightContext))
				return s;
			LOG("<tag ... />\n" + s);
			return convertE4X(s);
		})
		// <tag> ... </tag>
		//.replace(/<(\w+)(?:[^>]*[^>\/])?>([\s\S]*?)<\/\1>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
		.replace(getTagsPattern(), function(s) {
			if(inE4X(RegExp.leftContext) || alreadyConverted(s))
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
		return s;
	}
	return "";
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
	return />\s*(?:(?:\\n)?\\[\n\r]\s*)?$/.test(prev);
}
function alreadyConverted(s) {
	return /['">][ \t]*(?:\\n)?\\[\n\r]/.test(s);
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
	s = s.replace(/(=\s*)?\{([^\}]*)\}/g, function(s, eq, code, offset, str) {
		if(
			!eq
			&& /\s[-:\w]+\s*=\s*(?:"[^"]*|'[^']*)$/.test(str.substr(0, offset)) // foo="something{
			&& /^(?:[^"]*"|[^']*')(?:\s|\/?>)/.test(str.substr(offset)) // something"
		)
			return s; // Looks like we're inside attribute, leave as is
		code = "e4xConv_encodeHTML(" + code + (eq ? ", true" : "") + ")";
		var q = eq ? '"' : "";
		code = q + "' + " + code + " + '" + q;
		codes.push(code);
		return (eq || "") + rndExpr;
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
	try {
		return new DOMParser().parseFromString(xul, "application/xml").documentElement;
	}
	catch(e) {
		// See http://custombuttons.sourceforge.net/forum/viewtopic.php?f=5&t=3720
		// + https://forum.mozilla-russia.org/viewtopic.php?pid=732243#p732243
		var dummy = document.createElement("dummy");
		dummy.innerHTML = xul.trimLeft();
		return dummy.firstChild;
	}
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