// https://github.com/Infocatcher/Custom_Buttons/tree/master/Convert_E4X
// https://forum.mozilla-russia.org/viewtopic.php?id=56442
// http://custombuttons.sf.net/forum/viewtopic.php?f=2&t=365

// Convert E4X launcher for Custom Buttons
// Just place that code before specially commented code with E4X
// Explanation:
//   <that launcher>
//   /*** E4X ***
//   <code with E4X here>
//   *** E4X ***/
// Note: since used /* comments */ to store code with E4X, that code shouldn't contain such comments inside

// (c) Infocatcher 2012-2013, 2016-2017
// Converter version: 0.1.0b2 - 2017-03-15
// Launcher version: 0.1.0a1 - 2017-03-15

eval((function getCodeToEval() {
	var startMark = "\n/*** E4X ***\n";
	var endMark = "\n*** E4X ***/";
	var code = _phase == "code"
		? this.cbCommand
		: this.cbInitCode;
	var start = code.indexOf(startMark);
	var end = code.indexOf(endMark);
	if(start == -1 || end == -1) {
		Services.prompt.alert(
			window,
			"Convert E4X for Custom Buttons",
			"Code with E4X not found. Usage:\n<That header>\n/*** E4X ***\n<any code with E4X>\n*** E4X ***/"
		);
		return "";
	}
	var e4x = code.substring(start + startMark.length, end);
	var supportedE4X = (function() {
		try { return eval('typeof <foo/> == "xml"'); }
		catch(e) {}
		return false;
	})();
	var codeToEval = supportedE4X ? e4x : convertE4XCode(e4x) || e4x;
	//LOG("Code to eval:\n" + codeToEval);
	return codeToEval;
}).call(this));

// Code from from https://github.com/Infocatcher/Custom_Buttons/blob/master/Convert_E4X/convertE4X.js
//== convertE4XCode() begin
function convertE4XCode(s) {
	var _debug = false;

	convertE4XCode = convertCode;
	return convertCode(s);

	function _log(s) {
		_debug && LOG(s);
	};
	function convertCode(s) {
		if(!s || s == "/*CODE*/" || s == "/*Initialization Code*/")
			return "";
		var convertedNote = "/* Converted with https://github.com/Infocatcher/Custom_Buttons/tree/master/Convert_E4X */\n";
		if(s.indexOf(convertedNote) != -1)
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
				_log("<> ... </>\n" + s);
				return convertE4X(e4x);
			})
			// <![CDATA[ ... ]]>
			.replace(/(?:<>)?<!\[CDATA\[([\s\S]+?)\]\]>(?:<\/>)?(?:\s*\.\s*toString\s*\(\))?/g, function(s, cdata) {
				if(inE4X(RegExp.leftContext) || alreadyConverted(cdata))
					return s;
				_log("<![CDATA[ ... ]]>\n" + s);
				return convertCDATA(cdata);
			})
			// <tag ... />
			.replace(/<\w+\s([^>]+?)\/>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
				var lc = RegExp.leftContext;
				var rc = RegExp.rightContext;
				if(inE4X(lc) || inString(lc) || alreadyConverted(s) || /^(?:\\n)?\\[\n\r]/.test(rc))
					return s;
				_log("<tag ... />\n" + s);
				return convertE4X(s);
			})
			// <tag> ... </tag>
			//.replace(/<(\w+)(?:[^>]*[^>\/])?>([\s\S]*?)<\/\1>(?:\s*\.\s*toXMLString\s*\(\))?/g, function(s) {
			.replace(getTagsPattern(), function(s) {
				var lc = RegExp.leftContext;
				if(inE4X(lc) || inString(lc) || alreadyConverted(s))
					return s;
				_log("<tag> ... </tag>\n" + s);
				return convertE4X(s);
			})
			// All .toXMLString() calls are useless
			// Example:
			// window.openDialog("data:application/vnd.mozilla.xul+xml," + encodeURIComponent(dialog.toXMLString()), ...
			.replace(/\s*\.\s*toXMLString\s*\(\)/g, "");

		if(s != orig) {
			var codeHeader = /^(?:\/\*(?:CODE|Initialization Code)\*\/\n?)?/;
			if(/\WXML\s*\.\s*\w/.test(orig))
				s = s.replace(codeHeader, "$&var XML = window.XML || {};\n\n");
			s = s.replace(codeHeader, "$&" + convertedNote);
			var addFuncs = "";
			if(s.indexOf("e4xConv_parseXULFromString") != -1)
				addFuncs += "\n" + trimFunc(e4xConv_parseXULFromString);
			if(s.indexOf("e4xConv_encodeHTML") != -1)
				addFuncs += "\n" + trimFunc(e4xConv_encodeHTML);
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
	function inString(prev) {
		// Very basic check to not convert something like
		// node.innerHTML = '<div>...</div>';
		return /['"]$/.test(prev);
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
	function trimFunc(fn) {
		var fnCode = "" + fn;
		var spaces = /([ \t]+)\}$/.test(fnCode) && RegExp.$1;
		if(!spaces)
			return fnCode;
		return fnCode.replace(new RegExp("^" + spaces, "mg"), "");
	}
	function rnd() {
		return Date.now()
			+ Math.random().toFixed(14).substr(2)
			+ Math.random().toFixed(14).substr(2);
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
}
//== convertE4XCode() end

/*** E4X ***
// Place code with E4X here:

var x = "E4X";
var xml = <menupopup xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
	<menuitem label="1" />
	<menu label="q\w">
		<menupopup>
			<menuitem label={x} />
			<menuitem label={"Some " + x + " here"} />
			<menuitem label="{" />
			<menuitem label="}" />
			<menuitem label="{x}" />
			<menuitem label="Some {data} here" />
		</menupopup>
	</menu>
</menupopup>;
this.type = "menu";
this.appendChild(cbu.makeXML(xml));

*** E4X ***/