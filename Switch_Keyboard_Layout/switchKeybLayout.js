// http://infocatcher.ucoz.net/js/cb/switchKeybLayout.js
// https://github.com/Infocatcher/Custom_Buttons/tree/master/Switch_Keyboard_Layout

// Switch Keyboard Layout button for Custom Buttons
// (code for "code" section)

// (c) Infocatcher 2009, 2013
// version 0.2.0pre2 - 2013-02-13

// Convert text, typed in wrong keyboard layout.
// Configured for Russian <-> English.

var keybUtils = {
	//== Options
	noSelBehavior: { // Shift+Home
		ctrlKey:  false,
		altKey:   false,
		shiftKey: true,
		metaKey:  false,
		keyCode:  KeyEvent.DOM_VK_HOME,
		charCode: 0
	},
	// 0 - do nothing
	// 1 - convert all text
	// Or use object like following to simulate "keypress" event:
	/*
	noSelBehavior: { // Ctrl+Shift+Left
		ctrlKey:  true,
		altKey:   false,
		shiftKey: true,
		metaKey:  false,
		keyCode:  KeyEvent.DOM_VK_LEFT,
		charCode: 0
	}
	*/
	convTableForward: { // ru -> en
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
	},
	//== End of options
	button: this,
	get convTableBackward() {
		var ctb = { __proto__: null };
		var ctf = this.convTableForward;
		for(var c in ctf)
			ctb[ctf[c]] = c;
		delete this.convTableBackward;
		return this.convTableBackward = ctb;
	},
	inPrimaryLayout: function(s) {
		for(var i = 0, l = s.length; i < l; ++i) {
			var c = s.charAt(i);
			if(c in this.convTableForward)
				return true;
			if(c in this.convTableBackward)
				return false;
		}
		return false;
	},
	switchKeybLayout: function(s, convTable) {
		var res = "";
		for(var i = 0, l = s.length; i < l; ++i) {
			var c = s.charAt(i);
			res += c in convTable ? convTable[c] : c;
		}
		return res;
	},
	switchSelKeybLayout: function(_subCall, _focusFixed) {
		if(
			!_focusFixed
			&& "closeMenus" in window
			&& document.commandDispatcher.focusedElement == this.button
		) {
			closeMenus(this.button);
			setTimeout(function(_this) {
				_this.switchSelKeybLayout(_subCall, true);
			}, 0, this);
			return;
		}
		var fe = document.commandDispatcher.focusedElement;
		if(!fe)
			return;
		if(fe instanceof HTMLInputElement || fe instanceof HTMLTextAreaElement) {
			var ta = fe;
			try {
				var val = ta.value;
				var sel = val.substring(ta.selectionStart, ta.selectionEnd);
			}
			catch(e) { // Non-text HTMLInputElement
				return;
			}
			if(!sel && val && this.noSelBehavior && !_subCall) {
				if(this.noSelBehavior == 1) {
					ta.selectionStart = 0;
					ta.selectionEnd = val.length;
					sel = val;
				}
				else {
					this.handleNoSel(ta);
					return;
				}
			}
			if(!sel)
				return;
			var res = this.switchKeybLayout(
				sel,
				this.inPrimaryLayout(sel)
					? this.convTableForward
					: this.convTableBackward
			);
			if(res != sel)
				this.insertText(ta, res);
		}
		else if(fe.contentEditable == "true") {
			var doc = fe.ownerDocument;

			var docURI = doc.documentURI;
			if(
				docURI.substr(0, 5) == "data:"
				&& docURI.indexOf("chrome://browser/skin/devtools/") != -1
			) {
				//~ todo: seems like we only can use paste from clipboard here...
				return;
			}

			var sel = doc.defaultView.getSelection();
			var rng = sel.rangeCount && sel.getRangeAt(0);
			var tmpNode;
			if(!rng || rng.collapsed) {
				if(!this.noSelBehavior || _subCall)
					return;
				if(this.noSelBehavior == 1) {
					var r = doc.createRange();
					r.selectNodeContents(fe);
					sel.removeAllRanges();
					sel.addRange(r);
					tmpNode = fe.cloneNode(true);
				}
				else {
					this.handleNoSel(fe);
					return;
				}
			}
			else {
				tmpNode = doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
				tmpNode.appendChild(rng.cloneContents());
			}

			var orig = tmpNode.innerHTML;
			var convTable = this.inPrimaryLayout(tmpNode.textContent)
				? this.convTableForward
				: this.convTableBackward;

			var _this = this;
			var parseChildNodes = function(node) {
				if(node instanceof Element) {
					var childNodes = node.childNodes;
					for(var i = childNodes.length - 1; i >= 0; --i)
						parseChildNodes(childNodes[i]);
				}
				else if(node.nodeType == node.TEXT_NODE) {
					var text = node.nodeValue;
					var newText = _this.switchKeybLayout(node.nodeValue, convTable);
					if(newText != text)
						node.parentNode.replaceChild(doc.createTextNode(newText), node);
				}
			}
			parseChildNodes(tmpNode);

			var res = tmpNode.innerHTML;
			if(res != orig)
				doc.execCommand("insertHTML", false, res);
		}
	},
	handleNoSel: function(node) {
		this.select(node);
		this.switchSelKeybLayout(true);
	},
	select: function(node) {
		var e = this.noSelBehavior;
		if(!e || typeof e != "object")
			return;
		var evt = document.createEvent("KeyboardEvent");
		evt.initKeyEvent(
			"keypress", true /*bubbles*/, true /*cancelable*/, node.ownerDocument.defaultView,
			e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
			e.keyCode, e.charCode
		);
		node.dispatchEvent(evt);
	},
	insertText: function(ta, text) {
		var editor = ta.QueryInterface(Components.interfaces.nsIDOMNSEditableElement)
			.editor
			.QueryInterface(Components.interfaces.nsIPlaintextEditor);
		if(editor.flags & editor.eEditorReadonlyMask)
			return;

		var sTop = ta.scrollTop;
		var sHeight = ta.scrollHeight;
		var sLeft = ta.scrollLeft;
		// var sWidth = ta.scrollWidth;

		if(text)
			editor.insertText(text);
		else
			editor.deleteSelection(0, 0);

		ta.scrollTop = sTop + (ta.scrollHeight - sHeight);
		ta.scrollLeft = sLeft; // + (ta.scrollWidth - sWidth);
	}
};

var btn = this;
if(btn instanceof XULElement && addEventListener.length > 3) {
	addEventListener("command", function(e) {
		if(e.target != btn)
			return;
		e.preventDefault();
		e.stopPropagation();
		keybUtils.switchSelKeybLayout();
	}, true, this.parentNode);
}
keybUtils.switchSelKeybLayout();