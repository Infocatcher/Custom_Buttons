// https://forum.mozilla-russia.org/viewtopic.php?pid=373658#p373658

// Switch Keyboard Layout button for Custom Buttons

// (c) Infocatcher 2009
// version 0.1.0 - 2009-09-04

//== Code:
this.switchSelKeybLayout();

//== Initialization:
this.noSelUseFullText = true;
this.convTableForward = {
	"\"": "@",
	":": "^",
	";": "$",
	"?": "&",
	",": "?",
	"/": "|",
	".": "/",
	"э": "'",
	"б": ",",
	"ю": ".",
	"Ж": ":",
	"ж": ";",
	"Б": "<",
	"Ю": ">",
	"Э": "\"",
	"х": "[",
	"ъ": "]",
	"ё": "`",
	"Х": "{",
	"Ъ": "}",
	"Ё": "~",
	"№": "#",
	"Ф": "A",
	"ф": "a",
	"И": "B",
	"и": "b",
	"С": "C",
	"с": "c",
	"В": "D",
	"в": "d",
	"У": "E",
	"у": "e",
	"А": "F",
	"а": "f",
	"П": "G",
	"п": "g",
	"Р": "H",
	"р": "h",
	"Ш": "I",
	"ш": "i",
	"О": "J",
	"о": "j",
	"Л": "K",
	"л": "k",
	"Д": "L",
	"д": "l",
	"Ь": "M",
	"ь": "m",
	"Т": "N",
	"т": "n",
	"Щ": "O",
	"щ": "o",
	"З": "P",
	"з": "p",
	"Й": "Q",
	"й": "q",
	"К": "R",
	"к": "r",
	"Ы": "S",
	"ы": "s",
	"Е": "T",
	"е": "t",
	"Г": "U",
	"г": "u",
	"М": "V",
	"м": "v",
	"Ц": "W",
	"ц": "w",
	"Ч": "X",
	"ч": "x",
	"Н": "Y",
	"н": "y",
	"Я": "Z",
	"я": "z",
	__proto__: null
};

this.convTableBackward = { __proto__: null };
for(var c in this.convTableForward)
	this.convTableBackward[this.convTableForward[c]] = c;

this.insertText = function(ta, text, noFocus) {
	var editor = ta.QueryInterface(Components.interfaces.nsIDOMNSEditableElement)
		.editor
		.QueryInterface(Components.interfaces.nsIPlaintextEditor);
	if(editor.flags & editor.eEditorReadonlyMask)
		return;

	var sTop = ta.scrollTop;
	var sHeight = ta.scrollHeight;
	var sLeft = ta.scrollLeft;
	// var sWidth = ta.scrollWidth;

	if(noFocus) {
		var val = ta.value;
		var ss = ta.selectionStart;
		ta.value = val.substring(0, ss) + text + val.substring(ta.selectionEnd);
		var se = ss + text.length;
		ta.selectionStart = se;
		ta.selectionEnd = se;
	}
	else {

		if(text)
			editor.insertText(text);
		else
			editor.deleteSelection(0);
	}

	ta.scrollTop = sTop + (ta.scrollHeight - sHeight);
	ta.scrollLeft = sLeft; // + (ta.scrollWidth - sWidth);
};
this.inPrimaryLayout = function(s) {
	var c;
	for(var i = 0, l = s.length; i < l; i++) {
		c = s.charAt(i);
		if(c in this.convTableForward)
			return true;
		if(c in this.convTableBackward)
			return false;
	}
	return false;
};
this.switchKeybLayout = function(convTable, s) {
	var r = "", c;
	for(var i = 0, l = s.length; i < l; i++) {
		c = s.charAt(i);
		r += c in convTable ? convTable[c] : c;
	}
	return r;
};
this.switchSelKeybLayout = function(s) {
	try {
		var ta = document.commandDispatcher.focusedElement;
		var val = ta.value;
		var sel = val.substring(ta.selectionStart, ta.selectionEnd);
	}
	catch(e) {
		return;
	}
	if(this.noSelUseFullText && !sel) {
		ta.selectionStart = 0;
		ta.selectionEnd = val.length;
		sel = val;
	}
	if(!sel)
		return;

	sel = this.switchKeybLayout(
		this.inPrimaryLayout(sel) ? this.convTableForward : this.convTableBackward,
		sel
	);
	this.insertText(ta, sel);
};