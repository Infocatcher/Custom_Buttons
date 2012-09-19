// https://github.com/Infocatcher/Custom_Buttons/tree/master/Convert_E4X

// Conver E4X button for Custom Buttons
// Code for "code" section

// (c) Infocatcher 2012
// version 0.1.0a4 - 2012-09-19

// Tries convert deprecated E4X to string literals.
// Click on button and then click on another button with E4X in code (or click on opened page with *.js file).

addEventListener("click", function getButton(e) {
	var trg = e.target;

	var codes;
	if(trg.localName == "toolbarbutton" && /^custombuttons-button\d+$/.test(trg.id))
		codes = [trg.cbCommand, trg.cbInitCode];
	else if(
		trg.ownerDocument.defaultView == content
		&& /^application\/(?:x-)?javascript$/.test(trg.ownerDocument.contentType)
	)
		codes = [trg.ownerDocument.documentElement.textContent];

	if(!codes)
		return;
	removeEventListener(e.type, getButton, true);
	e.preventDefault();
	e.stopPropagation();
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
			return convertE4X(e4x);
		})
		// <![CDATA[ ... ]]>
		.replace(/(?:<>)?<!\[CDATA\[([\s\S]+?)\]\]>(?:<\/>)?(?:\s*\.\s*toString\s*\(\))?/g, function(s, cdata) {
			if(inE4X(RegExp.leftContext))
				return s;
			return convertCDATA(cdata);
		})
		// <tag> ... </tag>
		.replace(/<(\w+)[\s>]([\s\S]+?)<\/\1>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
			if(inE4X(RegExp.leftContext))
				return s;
			return convertE4X(s);
		})
		// <tag ... />
		.replace(/<\w+\s([^>]+?)\/>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
			if(inE4X(RegExp.leftContext))
				return s;
			return convertE4X(s);
		});

	if(s != orig) {
		if(/\WXML\s*\.\s*\w/.test(orig))
			s = 'if(typeof XML == "undefined")\n\tvar XML = {};\n\n' + s;
		// Add new parse function
		s += "\n\n" + e4xConv_parseXULFromString + "\n" + e4xConv_encodeHTML;

		out(s);
	}
}
function convertCDATA(s) {
	return "'" + escapeString(s.replace(/['\\]/g, "\\$&")) + "'";
}
function inE4X(prev) {
	return />\s*$/.test(prev);
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
		code = "e4xConv_encodeHTML(" + code + ")";
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
function e4xConv_encodeHTML(s) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}